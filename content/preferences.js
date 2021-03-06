Components.utils.import("resource://bartab/prototypes.js");

var BarTabPreferences = {

  init: function() {
    BarTabUtils.mPrefs.addObserver("extensions.bartap.hostWhitelist", this, false);
    this.onTimeoutChange();
    this.onLoadChange();
    this.updateHostWhitelist();
  },

  destroy: function() {
    BarTabUtils.mPrefs.removeObserver("extensions.bartap.hostWhitelist", this);
  },

  QueryInterface: function(aIID) {
    if (aIID.equals(Components.interfaces.nsIObserver) ||
        aIID.equals(Components.interfaces.nsISupports)) {
      return this;
    }
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },


  // Toggle visibility for timeout and load delay settings.

  onTimeoutChange: function() {
    var menuitem = document.getElementById('tapAfterTimeout').selectedItem;
    var timerWidgets = document.getElementById('timerWidgets');
    var visibility = (menuitem.value == "true") ? 'visible' : 'hidden';
    timerWidgets.style.visibility = visibility;
  },

  onLoadChange: function() {
    var menuitem = document.getElementById('loadOnSelect').selectedItem;
    var delayWidgets = document.getElementById('delayWidgets');
    var visibility = (menuitem.value == "2") ? 'visible' : 'hidden';
    delayWidgets.style.visibility = visibility;
  },

  // Add to and remove hosts from whitelist

  updateHostWhitelist: function() {
    var list = document.getElementById("hostWhitelist");
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }

    var whitelist = BarTabUtils.getHostWhitelist();
    whitelist.forEach(function(host) {
        let row = document.createElement("listitem");
        row.setAttribute("label", host);
        list.appendChild(row);
      });
  },

  hostSelected: function() {
    var removeButton = document.getElementById("hostWhitelistRemove");
    var list = document.getElementById("hostWhitelist");
    if (list.selectedItems.length) {
      removeButton.setAttribute("disabled", "false");
    } else {
      removeButton.setAttribute("disabled", "true");
    }
  },

  removeHost: function() {
    var list = document.getElementById("hostWhitelist");
    var whitelist = BarTabUtils.getHostWhitelist();
    var self = this;
    list.selectedItems.forEach(function (item) {
        var host = item.getAttribute("label");
        var index = whitelist.indexOf(host);
        if (index == -1) {
            return;
        }
        whitelist.splice(index, 1);
    });
    BarTabUtils.setHostWhitelist(whitelist);
  },

  addHost: function() {
    var textbox = document.getElementById("hostWhitelistNewHost");
    var whitelist = BarTabUtils.getHostWhitelist();
    var host = textbox.value.trim();

    if (!host) {
      return;
    }

    // Convert whole URLs to hostnames
    if ((host.substr(0, 7) == "http://")
        || (host.substr(0, 8) == "https://")) {
      try {
        host = BarTabUtils.makeURI(host).host;
      } catch(ex) {
        // Ignore
      }
    }

    // Sort out duplicates.
    if (whitelist.indexOf(host) != -1) {
      textbox.value = "";
      return;
    }

    // We don't allow semicolon in the host name
    // TODO it couldn't hurt to do a proper check for illegal characters
    if (host.indexOf(';') != -1) {
      return;
    }

    whitelist.push(host);
    BarTabUtils.setHostWhitelist(whitelist);
    textbox.value = "";
  },

  onNewHostKeyPress: function(event) {
    switch (event.keyCode) {
    case event.DOM_VK_ENTER:
    case event.DOM_VK_RETURN:
      this.addHost();
    }
  },

  observe: function(aSubject, aTopic, aData) {
    if (aTopic != "nsPref:changed") {
      return;
    }
    this.updateHostWhitelist();
  }

};
