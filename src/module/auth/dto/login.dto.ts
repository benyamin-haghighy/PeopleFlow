import { PartialType, PickType } from '@nestjs/swagger';
import { RegisterDto } from './register.dto';


export class LoginAuthDto extends PickType(RegisterDto, ['phone', 'password']) {}
