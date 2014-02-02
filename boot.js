// plain JS, loaded in the browser to bootstrap our test suite
(function() {
  var karma = window.__karma__;
  var DEBUG = /debug\.html([#?].*)?$/.test(window.top.location.href);
  var FAIL = function(msg) {
    karma.result({
      description: msg,
      suite: [],
      success: false,
      time: 0,
      log: []
    });
    karma.complete();
    if(DEBUG) alert(msg);
  }
  karma.start = function () {
    try {
      var config = karma.config || {};
      // ensure config.args is an array in the local window context
      // (otherwise, prototype methods may be missing)
      config.args = [].concat(config.args || []);
      var suitePath;

      if(DEBUG) {
        var suiteMatch = window.top.location.href.match(/[?&]suite=([^&#]+)/);
        suitePath = suiteMatch && suiteMatch[1];
        if (!suitePath) {
          return FAIL("When using debug.html you must specify your suite and arguments in the URL query params - e.g. debug.html?suite=test/run.html#--help");
        }
      } else {
        suitePath = config.args[0];
      }

      if (!suitePath) {
        return FAIL(JSON.stringify(config) + "Please specify path to your suite script as the first argument");
      }

      var customHubs = config.hubs || {};
      var hubs = {
        'sjs:': '/__sjs/__sjs/modules/'
      };
      for (var k in customHubs) {
        if (!Object.prototype.hasOwnProperty.call(customHubs, k)) continue;
        hubs[k] = customHubs[k];
      }

      for (var k in hubs) {
        if (!Object.prototype.hasOwnProperty.call(hubs, k)) continue;
        require.hubs.unshift([k, hubs[k]]);
      }

      if (suitePath.indexOf(':') == -1 && suitePath.charAt(0) !== '/') {
        // take relative to cwd (served by karma-sjs-adapter)
        suitePath = '/__sjs/' + suitePath;
      }

      require(suitePath,
        { main: true,
          callback: function(err, val) {
            if(err) FAIL(err.message || "");
            else karma.complete();
          }
        });
    } catch(e) {
      FAIL(e.message || "");
    }
  };
})();


