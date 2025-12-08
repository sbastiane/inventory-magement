import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { createUserSchema, updateUserSchema } from './user.schema';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await this.userService.createUser(data);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers();

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUserById(req.params.id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateUserSchema.parse(req.body);
      const user = await this.userService.updateUser(req.params.id, data);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.deleteUser(req.params.id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}