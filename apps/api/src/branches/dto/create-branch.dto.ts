import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({
    description: 'Human-readable title of the branch',
    example: 'Airport Kiosk',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description:
      'Unique uppercase code identifying the branch within the tenant',
    example: 'AIR1',
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description:
      'Operational IANA timezone identifier for shift and audit timestamps',
    example: 'Africa/Lagos',
    required: false,
    default: 'UTC',
  })
  @IsString()
  @IsOptional()
  timezone?: string;
}
