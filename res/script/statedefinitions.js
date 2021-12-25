class StateDefinitions {

  constructor ( pgm ) {

    this.startPlaybook = "pgm";

    /* -----------------------------------------------------
      Playbooks
       ----------------------------------------------------- */

    this.playbooks = {
        pgm: { object: pgm, enter: 'load', definition: this },
    };

    /* -----------------------------------------------------
      Global state setup
       ----------------------------------------------------- */

    this.stateTypes = {
      LOAD:         ['LOAD', 'RENDER' ],
      PLAY:         ['INIT','CLEANUP','RENDER','PROCESS','HANDLEINPUT'],
      WATCH:        ['INIT','CLEANUP','RENDER','PROCESS'],
      INIT:         ['INIT'],
      BRANCH:       ['BRANCH']
    };

    this.stateMethodSuffix = {
      LSRENDER:     'LSRender',
      LSPROCESS:    undefined,
      RENDER:       'Render',
      PROCESS:      'Run',
      HANDLEINPUT:  'Handle'
    };

    /* -----------------------------------------------------
      Demo playbook
       ----------------------------------------------------- */

	/* no branch functions */

	/* demo playbook */
    var demoPlaybook = this.playbooks.pgm;
    demoPlaybook.states = {

		/* Only load, play and repeat since this is a demo, not a game */

        'load':    { _type: "LOAD",  next: 'play'},
        'play':    { _type: "PLAY", next: 'play' },


      } ;
  }
}
