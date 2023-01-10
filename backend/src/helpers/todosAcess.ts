import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
    ) {
    }
  
    async getTodosForUser(userId: string): Promise<TodoItem[]> {
      logger.info('Getting all todos')
  
      const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.todosIndex,
        ExpressionAttributeValues: {
          ':userId': userId
        },
        KeyConditionExpression: 'userId = :userId',
      }).promise()
  
      const items = result.Items
      return items as TodoItem[]
    }
  
    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
      logger.info('Creating a todo');
      await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem
      }).promise()
  
      return todoItem;
    }
  
    async updateTodo(todoId: string, todo: TodoUpdate, userId: string): Promise<TodoUpdate> {
      logger.info('Updating a todo');
      const updated = await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        ExpressionAttributeNames: {
          '#todo_name': 'name',
        },
        ExpressionAttributeValues: {
          ':name': todo.name,
          ':dueDate': todo.dueDate,
          ':done': todo.done,
        },
        UpdateExpression: 'SET #todo_name = :name, dueDate = :dueDate, done = :done',
        ReturnValues: 'ALL_NEW',
      }).promise()
  
      logger.info(updated.Attributes);
      return todo;
    }
  
  
    async deleteTodo(todoItemId: string, userId: string): Promise<boolean> {
      logger.info('Deleting a todo');
      await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          todoId: todoItemId,
          userId: userId
        },
      }).promise()
  
      return true;
    }
  }
  
  function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      logger.info('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }