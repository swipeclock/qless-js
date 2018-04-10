exports.command = 'job <command>';
exports.desc = 'Interact with a qless job';
exports.builder = (yargs) => {
  return yargs.commandDir('job_cmds');
};
exports.handler = () => {};
