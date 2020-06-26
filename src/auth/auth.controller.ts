import {Body, Controller, Delete, Post, UseGuards, ValidationPipe} from '@nestjs/common';
import {AuthCredentialsDto} from "./dto/auth-credentials.dto";
import {AuthService} from "./auth.service";
import {AuthGuard} from "@nestjs/passport";
import {GetUser} from "./get-user.decorator";
import {User} from "./User.entity";
import {
    ApiBadRequestResponse,
    ApiBearerAuth, ApiConflictResponse,
    ApiCreatedResponse, ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }


    // @UseGuards(AuthGuard())
    @Post('/signup')
    @ApiCreatedResponse()
    @ApiBadRequestResponse()
    @ApiConflictResponse()
    signUp(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.authService.signUp(authCredentialsDto);
    }

    @Post('/signin')
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    signIn(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
        return this.authService.signIn(authCredentialsDto);
    }

    @UseGuards(AuthGuard())
    @Delete('/delete/user')
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    deleteUser(@GetUser() user: User): Promise<void> {
        return this.authService.deleteUser(user);
    }
}
