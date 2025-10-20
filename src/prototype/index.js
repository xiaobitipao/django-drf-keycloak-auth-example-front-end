String.prototype.format = function (argument) {
  // console.log('Hello, {name}. I am {age}.'.format({ name: 'zhangsan', age: 24 }))
  if (typeof argument !== "object") {
    return this;
  }
  let str = this;
  for (let key in argument) {
    str = str.replace(new RegExp("\\{" + key + "\\}", "g"), argument[key]);
  }
  return str;
};
