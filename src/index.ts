import 'dotenv/config'

console.log('hi');

// async await test top level
await new Promise((resolve) => {
  setTimeout(() => {
    resolve('done');
  }, 1000);
});
