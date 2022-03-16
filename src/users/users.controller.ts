import { Controller, Get, Logger, Post, Req, Inject } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { User } from './user.entity';
import { ClientKafka, Ctx, KafkaContext, MessagePattern, Payload } from '@nestjs/microservices';

@Controller('user')
export class UsersController {
  constructor(
    private usersService: UsersService,
    @Inject('any_name_i_want') private readonly client: ClientKafka,
  ) {}

 async onModuleInit() {
  this.client.subscribeToResponseOf('dan');
  await this.client.connect();
}

  @MessagePattern('dan')
  logConsumer(@Payload() message:any, @Ctx() ctx:KafkaContext){
    Logger.log('message')
    Logger.log(message)
    Logger.log('ctx')
    Logger.log(ctx)
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Post()
  create(@Req() request: Request) {
    const user = new User();
    user.firstName = request.body.firstName;
    user.lastName = request.body.lastName;

    return this.usersService.create(user);
  }

  @Post('message')
  message(@Req() request: Request) {
    // console.log(request.body);
    Logger.log(request.body);
    return this.client.emit('omar', request.body);
  }
}
