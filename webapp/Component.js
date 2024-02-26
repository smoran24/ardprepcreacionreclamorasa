sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"AR_DP_ADMIN_CREACIONRECLAMO_RASA/AR_DP_ADMIN_CREACIONRECLAMO_RASA/model/models"
], function (UIComponent, Device, JSONModel, models) {
	"use strict";

	return UIComponent.extend("AR_DP_ADMIN_CREACIONRECLAMO_RASA.AR_DP_ADMIN_CREACIONRECLAMO_RASA.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			var t = new JSONModel({

				toCreateData: {
					ID_RECLAMO: "",
					ID_FOTO: 0,
					FECHA_CREACION: "",
					NOMBRE_ARCHIVO: "",
					ID_USUARIO: ""

				},
				contentToUp: "",
				selected: ["jpg", "png", "jpeg"]
			});
			this.setModel(t, "DocModel");

		

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		},
		getContentDensityClass: function () {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});