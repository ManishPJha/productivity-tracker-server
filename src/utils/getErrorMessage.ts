import config from '../config';
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return config.isProduction ? error.message : error.stack!;
  }

  return 'Unknown error occurred!';
}

export default getErrorMessage;
