exports.command = 'resource <command>';
exports.desc = 'Interact with a queue';
exports.builder = (yargs) => {
  return yargs.commandDir('resource_cmds');
};
exports.handler = () => {};
