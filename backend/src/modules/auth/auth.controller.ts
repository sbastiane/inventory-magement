import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { loginSchema } from './auth.schema';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await this.authService.login(data);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  };
}