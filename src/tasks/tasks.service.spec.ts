import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskRepository } from './task.repository';
import { TasksService } from './tasks.service';
import { Test } from '@nestjs/testing';
import { Task } from './task.entity';
import { NotFoundException } from '@nestjs/common';

const mockUser = { username: 'Test user', id: '1' };

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('get all tasks from the repository', async () => {
      const mockedResult = [new Task()];
      taskRepository.getTasks.mockResolvedValue(mockedResult);
      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'some query',
      };
      const result = await tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual(mockedResult);
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() & successfully return the task', async () => {
      const mockedResult = new Task();
      taskRepository.findOne.mockResolvedValue(mockedResult);
      const result = await tasksService.getTaskById(mockedResult.id, mockUser);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockedResult.id, userId: mockUser.id },
      });
      expect(result).toEqual(mockedResult);
    });

    it('throw an error as task is not found', async () => {
      taskRepository.findOne.mockResolvedValue(null);

      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createNewTask', () => {
    it('create new task by repository', async () => {
      const createTaskDto = {
        title: 'test title',
        description: 'test description',
      };
      const task = new Task();
      task.title = createTaskDto.title;
      taskRepository.createTask.mockResolvedValue(task);
      const result = await tasksService.createNewTask(createTaskDto, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      );
      expect(result.title).toEqual(createTaskDto.title);
    });
  });

  describe('updateTaskStatus', () => {
    it('getTaskById has been called', async () => {
      const save = jest.fn().mockResolvedValue(true);

      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      });
      const result = await tasksService.updateTaskStatus(
        1,
        TaskStatus.IN_PROGRESS,
        mockUser,
      );
      expect(tasksService.getTaskById).toHaveBeenCalledWith(1, mockUser);
      expect(result.status).toEqual(TaskStatus.IN_PROGRESS);
    });
  });
});
