import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)          // every route in this controller needs login
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  // POST /rooms  →  create a DM or Group room
  @Post()
  create(@Request() req, @Body() dto: CreateRoomDto) {
    return this.roomService.create(req.user.userId, dto);
  }

  // GET /rooms  →  list all rooms the logged-in user belongs to
  @Get()
  findMyRooms(@Request() req) {
    return this.roomService.findMyRooms(req.user.userId);
  }

  // GET /rooms/:id  →  get one room by its ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findById(id);
  }

  // PATCH /rooms/:id  →  update name or description (creator only)
  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomService.update(req.user.userId, id, dto);
  }

  // POST /rooms/:id/members/:memberId  →  add a member (creator only)
  @Post(':id/members/:memberId')
  addMember(
    @Request() req,
    @Param('id') roomId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.roomService.addMember(req.user.userId, roomId, memberId);
  }

  // DELETE /rooms/:id/members/:memberId  →  remove a member
  @Delete(':id/members/:memberId')
  removeMember(
    @Request() req,
    @Param('id') roomId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.roomService.removeMember(req.user.userId, roomId, memberId);
  }
}
