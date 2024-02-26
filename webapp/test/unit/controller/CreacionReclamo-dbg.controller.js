/*global QUnit*/

sap.ui.define([
	"AR_DP_ADMIN_CREACIONRECLAMO_RASA/AR_DP_ADMIN_CREACIONRECLAMO_RASA/controller/CreacionReclamo.controller"
], function (Controller) {
	"use strict";

	QUnit.module("CreacionReclamo Controller");

	QUnit.test("I should test the CreacionReclamo controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});