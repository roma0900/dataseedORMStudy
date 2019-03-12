sap.ui.define([], function() {
	"use strict";
	return {
		userNameFormatter: function(surname, name, thirdname) {
			var sResult = "";
			sResult = surname + " " + name.split("")[0] + ". " + thirdname.split("")[0] + ".";
			return sResult;
		}
	};
});