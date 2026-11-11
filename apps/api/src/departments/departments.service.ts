import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { eq, and, ne } from 'drizzle-orm';

export interface CreateDepartmentInput {
  branchId: string;
  name: string;
  type?: 'RECEPTION' | 'PRODUCTION' | 'DISBURSEMENT' | 'STORE';
}

export interface UpdateDepartmentInput {
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

/**
 * Service managing tenant department catalog operations including creation,
 * renaming, status toggling, and tenant-scoped retrieval.
 */
@Injectable()
export class DepartmentsService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
  ) {}

  /**
   * Retrieves all departments belonging strictly to the specified tenant.
   *
   * @param tenantId - The UUID of the authenticated tenant.
   * @returns An array of department records for the tenant.
   */
  async list(tenantId: string) {
    return this.db
      .select()
      .from(schema.departments)
      .where(eq(schema.departments.tenantId, tenantId));
  }

  /**
   * Creates a new department within a branch belonging to the tenant.
   *
   * @param tenantId - The UUID of the tenant owning the department.
   * @param input - The department creation parameters.
   * @returns The created department database record.
   * @throws {NotFoundException} If the specified branchId does not belong to the tenant.
   * @throws {ConflictException} If a department with the same name already exists in the branch.
   */
  async create(tenantId: string, input: CreateDepartmentInput) {
    // 1. Verify branch belongs to this tenant (cross-tenant protection)
    const [branch] = await this.db
      .select({ id: schema.branches.id })
      .from(schema.branches)
      .where(
        and(
          eq(schema.branches.tenantId, tenantId),
          eq(schema.branches.id, input.branchId),
        ),
      )
      .limit(1);

    if (!branch) {
      throw new NotFoundException('Branch not found in tenant');
    }

    // 2. Verify department name uniqueness in the branch
    const existing = await this.db
      .select({ id: schema.departments.id })
      .from(schema.departments)
      .where(
        and(
          eq(schema.departments.tenantId, tenantId),
          eq(schema.departments.branchId, input.branchId),
          eq(schema.departments.name, input.name),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Department name already exists in this branch');
    }

    const [dept] = await this.db
      .insert(schema.departments)
      .values({
        tenantId,
        branchId: input.branchId,
        name: input.name,
        type: input.type || 'PRODUCTION',
        status: 'ACTIVE',
      })
      .returning();

    return dept;
  }

  /**
   * Updates an existing department's name or active/inactive lifecycle status.
   *
   * @param tenantId - The UUID of the tenant owning the department.
   * @param departmentId - The UUID of the department to update.
   * @param input - The update fields (name, status).
   * @returns The updated department database record.
   * @throws {NotFoundException} If the department is not found in the tenant.
   * @throws {ConflictException} If renaming conflicts with another department in the branch.
   */
  async update(tenantId: string, departmentId: string, input: UpdateDepartmentInput) {
    // 1. Locate department within tenant scope
    const [department] = await this.db
      .select()
      .from(schema.departments)
      .where(
        and(
          eq(schema.departments.tenantId, tenantId),
          eq(schema.departments.id, departmentId),
        ),
      )
      .limit(1);

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // 2. If renaming, check for collision in the same branch excluding this department
    if (input.name && input.name !== department.name) {
      const conflict = await this.db
        .select({ id: schema.departments.id })
        .from(schema.departments)
        .where(
          and(
            eq(schema.departments.tenantId, tenantId),
            eq(schema.departments.branchId, department.branchId),
            eq(schema.departments.name, input.name),
            ne(schema.departments.id, departmentId),
          ),
        )
        .limit(1);

      if (conflict.length > 0) {
        throw new ConflictException('Department name already exists in this branch');
      }
    }

    // 3. Perform update
    const [updated] = await this.db
      .update(schema.departments)
      .set({
        ...(input.name ? { name: input.name } : {}),
        ...(input.status ? { status: input.status } : {}),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.departments.tenantId, tenantId),
          eq(schema.departments.id, departmentId),
        ),
      )
      .returning();

    return updated;
  }
}
