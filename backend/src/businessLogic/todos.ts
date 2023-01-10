import { TodosAccess } from '../helpers/todosAcess'
import *as b from '../helpers/todosAcess'
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
//const attachmentUtils = new AttachmentUtils();

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
      attachmentUrl: null
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


export const createAttachmentPresignedUrl = async(userId: string, todoId: string, attachmentId: string): Promise<string|Error> => {
    try {
      const attachmentData = await AttachmentUtils(attachmentId)
      logger.info(`File upload -> Generate URL`, {
        userId,
        todoId,
        attachmentData
      })
      const fileUrl = await b.generateUploadUrl(userId, todoId, attachmentData.uploadUrl)
      logger.info(`File upload -> Database set`, {
        fileUrl,
        userId,
        todoId,
        uploadUrl: attachmentData.uploadUrl
      })
      return attachmentData.putObject
    } catch (e) {
      logger.error(`File upload -> `, {
        Error: e,
        userId,
        todoId
      })
      return createError(403, `Unauthorized.`)	
    }
  }