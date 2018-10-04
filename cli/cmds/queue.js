exports.command = 'queue <command>';
exports.desc = 'Interact with a queue';
exports.builder = (yargs) => {
  return yargs.commandDir('queue_cmds');
};
exports.handler = () => {};
