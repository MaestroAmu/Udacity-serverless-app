import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate';

// TODO: Implement businessLogic
const logger = createLogger('Todos')


const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('Getting all todos');

  return todosAccess.getTodosForUser(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  try {
    logger.info("Creating a new todo");

    if (createTodoRequest.name.trim().length == 0) {
      throw new Error("Name cannot be an empty string");
    }

    const itemId = uuid.v4()

    return await todosAccess.createTodo({
      todoId: itemId,
      userId: userId,
      createdAt: new Date().toISOString(),
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      done: false,
      attachmentUrl: `https://${AttachmentUtils.bucketName}.s3.amazonaws.com/${itemId}`
    })
  } catch (error) {
    createError(error);
  }

}
export async function updateTodo(
  todoItemId: string,
  updateTodoRequest: UpdateTodoRequest,
  userId: string,
): Promise<TodoUpdate> {

  try {
    logger.info("Updating a todo");


    if (updateTodoRequest.name.trim().length == 0) {
      throw new Error("Name cannot be an empty string");
    }

    return await todosAccess.updateTodo(todoItemId = todoItemId, updateTodoRequest, userId);
  } catch (error) {
    createError(error);
  }
}

export async function deleteTodo(todoItemId: string, userId: string) {
  try {
    logger.info("Deleting a todo");

    return await todosAccess.deleteTodo(todoItemId, userId);
  } catch (error) {
    createError(error);
  }
}

export async function createAttachmentPresignedUrl(imageId: string, userId: string) {
  try {
    if (!userId)
      throw new Error("User Id is missing");

    return await attachmentUtils.getUploadUrl(imageId);
  } catch (error) {
    createError(error);
  }
}