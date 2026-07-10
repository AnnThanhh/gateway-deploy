import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// DTO (Data Transfer Object) để định nghĩa cấu trúc dữ liệu của request body
export class LoginDTO {
  @ApiProperty({ example: 'example@gmail.com' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail(undefined, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: 'Example@123' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;

  @ApiProperty({ example: '123456' })
  @IsOptional()
  @IsString()
  token?: string; // token 2FA (nếu có)
}
