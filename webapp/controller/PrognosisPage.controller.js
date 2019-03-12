sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/ui/model/json/JSONModel", "./utilities", "../services/DictionaryService",
	"../libs/XLSXlib"
], function(Controller, MessageBox, XLSXjs, utilities, dictionaryService) {
	"use strict";

	return Controller.extend("com.sap.build.standard.scopeCopy.controller.PrognosisPage", {
		onInit: function() {
			this.DataCSV = {};
		},
		onChangeFUP: function(e) {
			var input = "idfileUploader";
			if (this.getView().byId(input).mProperties.value === "") {
				var msg = new sap.m.Text({text: "{i18n>NoFileSelected}"});
				MessageBox.Icon.WARNING;
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.ui.commons.MessageBox.show(
					msg,
					sap.ui.commons.MessageBox.Icon.WARNING,
					"Уупс, что-то пошло не так", [sap.ui.commons.MessageBox.Action.OK],
					sap.ui.commons.MessageBox.Action.YES);
				return;
			} else if ((this.getView().byId(input).mProperties.value).split(".")[1] !== "csv") {
				var msg = new sap.m.Text({text: "{i18n>SuccessHistMsg}"});
				console.log("succ1");
				MessageBox.Icon.WARNING;
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.ui.commons.MessageBox.show(
					"Видимо, вы выбрали неподдерживаемый файл",
					sap.ui.commons.MessageBox.Icon.WARNING,
					"Уупс, что-то пошло не так", [sap.ui.commons.MessageBox.Action.OK],
					sap.ui.commons.MessageBox.Action.YES);
				return;
			}
			// firstEnter=true;
			this._import(e.getParameter("files") && e.getParameter("files")[0]);
		},
		_import: function(file) {
			var that = this;
			if (file && window.FileReader) {
				var reader = new FileReader();
				this.handleOnLoad = this.handleOnLoad.bind(this);
				reader.onload = this.handleOnLoad;
				reader.readAsText(file);
			}
		},
		handleOnLoad: function(e) {
			var strCSV = e.target.result; //string in CSV
			strCSV = strCSV.split('\n');
			for (var i in strCSV) {
				strCSV[i] = strCSV[i].split(';');
			}
			strCSV.splice(0, 1);
			strCSV.splice(strCSV.length - 1, 1);
			this.DataCSV = strCSV;
		}
	});

});