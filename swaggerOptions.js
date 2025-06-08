// swaggerOptions.js
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'MedScribe Backend API',
      version: '1.0.0',
      description: 'API documentation for MedScribe Backend',
    },
    servers: [
      {
        url: 'http://localhost:4000', 
      },
    ],
  },
  apis: ['./routes/*routes.js'],
};

export default swaggerOptions;