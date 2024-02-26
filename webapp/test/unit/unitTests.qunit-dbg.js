/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"AR_DP_ADMIN_CREACIONRECLAMO_RASA/AR_DP_ADMIN_CREACIONRECLAMO_RASA/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});