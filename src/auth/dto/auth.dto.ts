import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
} from 'class-validator';

export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Matches(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/,
        {
            message:
                'Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character',
        },
    )
    password: string;
}
