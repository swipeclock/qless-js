Limitations / TODOs

# Priority 1
- enable TTL watchdog
- listen for cancel, timeout, lock_lost events and kill the relevant worker
- stalled jobs might not be handled right? (worst case is user has to go under "stalled" and timeout the jobs manually)
- tests around forking worker states
- benchmarking jobs
~~- allow for forking worker configuration\logging override~~
~~- allow for logging override~~
~~- support boostrapping child procs~~


# NOTES and BACKLOG
- implemented explicity set\get methods for item that were handled with __getitem__ __setitem in python.  Could use Proxy objects, but that would require node > 4
- need to cleanup how stubs are restored to be more resilient to test failures