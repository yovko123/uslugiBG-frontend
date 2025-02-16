interface Config {
    API_URL: string;
    ASSETS_URL: string;
  }
  
  const config: Config = {
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3005',
    ASSETS_URL: `${process.env.REACT_APP_API_URL || 'http://localhost:3005'}`
  };
  
  export default config;