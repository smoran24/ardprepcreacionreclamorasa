sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"jquery.sap.global",
	'sap/ui/core/Fragment',
	'sap/ui/model/Filter',
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/UploadCollectionParameter"
], function (Controller, MessageToast, global, Fragment, Filter, jquery, Button, Dialog, Text, UploadCollectionParameter) {
	"use strict";
	var oView, oSAPuser, t, Button, Dialog, oSelectedItem, data, envio = [],
		arrmensaje = [],
		dealer, mod, prueba = [],
		itemUploadCollection = [];
	//FIN
	return Controller.extend("AR_DP_ADMIN_CREACIONRECLAMO_RASA.AR_DP_ADMIN_CREACIONRECLAMO_RASA.controller.principal", {

		onInit: function () {
			t = this;
			oView = this.getView();
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'GET',
                dataType:"json",
				url:appModulePath+  "/services/userapi/currentUser",
				success: function (dataR, textStatus, jqXHR) {
					oSAPuser = dataR.name;

					// oSAPuser = "P001442";
					t.leerUsuario(oSAPuser);
				},
				error: function (jqXHR, textStatus, errorThrown) {}
			});
			// t.leerUsuario(oSAPuser);
			t.ConsultaOdata();
			t.ConsultaOdata2();
		},
		ConsultaOdata: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var region = appModulePath+ '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/motivosReclamos';
          
            ////console.log(region);
			//Consulta
			$.ajax({
				type: 'GET',
				url: region,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {

					////console.log(dataR);
					var tReclamo = new sap.ui.model.json.JSONModel(dataR.d.results);
					oView.setModel(tReclamo, "reclamos");
				},
				error: function (jqXHR, textStatus, errorThrown) {
					////console.log(JSON.stringify(jqXHR));
				}
			});
		},
		ConsultaOdata2: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var region = appModulePath+ '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata';
         
            ////console.log(region);
			//Consulta
			$.ajax({
				type: 'GET',
				url: region,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {

					////console.log(dataR);

				},
				error: function (jqXHR, textStatus, errorThrown) {
					////console.log(JSON.stringify(jqXHR));
				}
			});
		},
		leerUsuario: function (oSAPuser) {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var url = appModulePath+ '/destinations/IDP_Nissan/service/scim/Users/' + oSAPuser;
    
            //Consulta
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: false,
				success: function (dataR, textStatus, jqXHR) {
					if (dataR["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"] === undefined) {
						var custom = "";
					} else {
						var custom = dataR["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes;
					}

					for (var x = 0; x < custom.length; x++) {
						if (custom[x].name === "customAttribute6") {
							dealer = "0000" + custom[x].value;
						}
					}

				},
				error: function (jqXHR, textStatus, errorThrown) {

				}
			});
			////console.log(dealer);
		},

		entrega: function () {
			var a = oView.byId("entrega").getValue();
			for (var i = 0; i < a.length; i++) {
				if (a.length <= 9) {

					a = "0" + a;
				}

			}
			oView.byId("entrega").setValue(a);
		},
		validar: function () {
			var arr = [];

			if (oView.byId("remito").getValue() === "" && oView.byId("entrega").getValue() === "") {
				var obj = {
					codigo: "03",
					descripcion: "Entrega o remito son campos obligatorios"
				};
				arr.push(obj);

				t.popError(arr, "Error Validación");
			} else {
				t.Consultaremito();
			}
		},

		generacionjson: function (oEvent) {
			var json55 = [];
			var json = [];
			var arr = [];

			var dato = oEvent.getSource().getParent().mAggregations.content[0]._aSelectedPaths;
			for (var i = 0; i < dato.length; i++) {
				var oSelectedItem2 = dato[i];
				oSelectedItem2 = parseInt(oSelectedItem2.replace(/\//g, ""), 10);
				json.push(oSelectedItem2);
			}

			if (json.length === 0) {
				envio = [];

			} else {
				envio = [];
				for (var j = 0; j < json.length; j++) {
					oView.getModel("listadoReclamo").oData[j]
					json55.push(oView.getModel("listadoReclamo").oData[json[j]]);

				}
				var PIEZA = [];
				var anexos = [],
					pedweb = [],
					flag = true;
				//console.log(json55);

				for (var i = 0; i < json55.length; i++) {
					pedweb.push(json55[i].Pedidoweb);
				}
				//console.log(pedweb);
				var uniqs = pedweb.filter(function (item, index, array) {
					return array.indexOf(item) === index;
				});
				//console.log(uniqs)
				for (var c = 0; c < uniqs.length; c++) {
					flag = true;
					for (var i = 0; i < json55.length; i++) {
						if (uniqs[c] === json55[i].Pedidoweb) {
							var json2 = {
									"MATERIAL": json55[i].Material,
									"DESCRIPCION": json55[i].Descripcion,
									"CANTFACTURADA": json55[i].Cantidadfacturada,
									"CANTRECLAMADA": json55[i].cantidadreclamada,
									"COMENTARIODEALER": json55[i].ComentarioRecl,
									"ID_MOTIVO": json55[i].tiporeclamo,
									"COMENTARIONISSAN": '',
									"pedidoweb": json55[i].Pedidoweb
								}
								////console.log(json2);
							PIEZA.push(json2);

							for (var b = 0; b < json55[i].anexoT.length; b++) {
								//	anexos.push(json55[i].anexoT[b]);
								anexos.push({
									codigo: json55[i].anexoT[b].codigo,
									datafile: json55[i].anexoT[b].datafile,
									filename: json55[i].anexoT[b].filename,
									MATERIAL: json55[i].Material,
									PEDIDOWEB: json55[i].Pedidoweb,
									ENTREGA: json55[0].Entrega
								});
							}
						}
					}
					if (flag) {
						var json = {
							"DEALER": dealer,
							"FECHA": '',
							"ENTREGA": json55[0].Entrega,
							"REMITOLEGAL": json55[0].Remitolegal,
							"FECHAREMITO": json55[0].Fecharemito,
							"PEDIDOWEB": uniqs[c],
							"PEDIDODEALER": json55[0].Pedidodealer,
							"TIPOPEDIDO": json55[0].Tipopedido,
							"FACTURASAP": json55[0].Facturasap,
							"FACTURALEGAL": json55[0].Facturalegal,
							"FECHAFACTURADA": json55[0].Fechafactura,
							"ID_USUARIOCREACION": oSAPuser,
							"ID_USUARIOGESTION": '',
							"ID_EDO_REC": json55[0].tiporeclamo,
							"ID_NOTA_ENTREGA": '',
							"PIEZA": PIEZA,
							"anexo": [],
							"anexoT": anexos

						};
						flag = false;
					}
					envio.push(json);
					PIEZA = [];
					anexos = [];
				}
				// envio = JSON.stringify(json);
				//console.log(envio);

			}

		},

		validajson: function () {
			var arr = [],
				flag = true;

			if (envio === undefined || envio === "") {
				flag = true;
			} else {
				var json2 = envio;
				for (var d = 0; d < json2.length; d++) {
					for (var i = 0; i < json2[d].PIEZA.length; i++) {

						if (json2[d].PIEZA[i].CANTRECLAMADA !== "" && json2[d].PIEZA[i].CANTRECLAMADA !== 0 && json2[d].PIEZA[i].CANTRECLAMADA !==
							undefined) {
							flag = false;

						}
					}
				}
			}

			if (flag) {

				var obj = {
					codigo: "500",
					descripcion: "Al menos un material debe ser Reclamado"
				};
				arr.push(obj);

				t.popError(arr, "Error de Validación");
			} else {
				for (var d = 0; d < json2.length; d++) {
					// //console.log(json2[d]);
					t.grabar(json2[d]);

				}
				t.popSucces(arrmensaje, "Resultado");

			}
		},
		grabar: function (json) {
			var jsongrabar = json;
			//	envio = JSON.stringify(json);
			var flagc = false;
			var flagi = false;
			var arr = [];
			var correcto = [];
			var incorrecto = [];
			var validacion = [];
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
            $.ajax({
				type: 'POST',
				url: appModulePath+ '/destinations/AR_DP_REP_DEST_HANA/XSJS_Creacion_Reclamos.xsjs',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: false,
				data: JSON.stringify(jsongrabar),
				success: function (dataG, textStatus, jqXHR) {
					// envio = "";

					for (var i = 0; i < dataG.Mensaje.length; i++) {
						if (dataG.Mensaje[i].Status === "S") {
							flagc = true;
							correcto.push(dataG.Mensaje[i].Codigo);
						}
						if (dataG.Mensaje[i].Status === "E") {
							flagi = true;
							incorrecto.push(dataG.Mensaje[i].Codigo);
						}

					}

					if (flagc === true && flagi === false) {
						//console.log("entro al primero carlosss");
						var obj = {
							codigo: "200",
							descripcion: dataG.Mensaje[0].Mensaje
								//"SE HAN RECLAMADO " + correcto.length + " MATERIALES  EXITOSAMENTE"
						};
						arrmensaje.push(obj);
						// t.popError(arr, "Reclamos Creado Exitosamente");

					} else if (flagc === false && flagi === true) {
						//console.log("entro al segundo carlosss")
						//revisar
						var mensaje = "";
						if (incorrecto.length > 1) {
							mensaje = " EXISTIÓ  UN PROBLEMA AL CREAR   " + incorrecto.length + " RECLAMOS  "
						} else {
							mensaje = " EXISTIÓ  UN PROBLEMA AL CREAR   " + incorrecto.length + " RECLAMO  "
						}
						var obj = {
							codigo: "400",
							descripcion: mensaje
						};
						arrmensaje.push(obj);
						// t.popError(arr, "Error");
					} else {
						//console.log("entro al tercero carlosss")
						var obj = {
							codigo: "200",
							descripcion: " SE HAN RECLAMADO  " + correcto.length + " MATERIALES CORRECTAMENTE Y  " + incorrecto.length +
								" NO SE CREARON CORRECTAMENTE "
						};
						arrmensaje.push(obj);

						t.limpiar();
					}

					for (var z = 0; z < correcto.length; z++) {

						t.idfoto(correcto[z], jsongrabar.anexoT);

					}

					t.eliminarcionsobrantes(jsongrabar);
					t.eliminarErrores(incorrecto);

				},
				error: function (jqXHR, textStatus, errorThrown) {
					////console.log(jqXHR);
					var obj = {
						codigo: "500",
						descripcion: "Error de Comunicación "
					};
					arr.push(obj);

					t.popError(arr, "Error en  Creación de Reclamo");
				}
			});
			//console.log(arrmensaje);
		},
		eliminarcionsobrantes: function (jsongrabar) {
			var total = oView.getModel("listadoReclamo").oData;
			//console.log(total);
			var flag = true;
			for (var c = 0; c < total.length; c++) {
				for (var v = 0; v < total[c].anexoT.length; v++) {
					for (var x = 0; x < jsongrabar.anexoT.length; x++) {
						if (total[c].anexoT[v].codigo === jsongrabar.anexoT[x].codigo) {
							flag = false;
						}

					}
					for (var x = 0; x < envio.length; x++) {
						for (var j = 0; j < envio[x].anexoT.length; j++) {
							if (total[c].anexoT[v].codigo === envio[x].anexoT[j].codigo) {
								flag = false;
							}
						}

					}
					if (flag) {
						t.fndetele(total[c].anexoT[v].filename);
					}
					flag = true;
				}
			}

		},

		eliminarErrores: function (arrError) {
			var total = oView.getModel("listadoReclamo").oData;

			for (var c = 0; c < total.length; c++) {
				if ((arrError.indexOf(total[c].Material)) >= 0) {
					for (var v = 0; v < total[c].anexoT.length; v++) {
						t.fndetele(total[c].anexoT[v].filename);
					}
				}

			}

		},
		idfoto: function (data, anex) {
			//console.log(anex);

			for (var x = 0; x < anex.length; x++) {
				var json = [];
				json = {
					ID_FOTO: anex[x].codigo,
					FECHA_CREACION: "\/Date(" + new Date().getTime() + ")\/",
					NOMBRE_ARCHIVO: anex[x].filename,
					ID_USUARIO: oSAPuser,
					ID_RECLAMO: data,
					ENTREGA: anex[x].ENTREGA,
					PEDIDOWEB: anex[x].PEDIDOWEB,
					NROPIEZA: anex[x].MATERIAL

				};
                var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                var appModulePath = jQuery.sap.getModulePath(appid);
				$.ajax({
					type: 'POST',
					url: appModulePath+ '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/Foto',
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					async: true,
					data: JSON.stringify(json),
					success: function (dataG, textStatus, jqXHR) {

					},
					error: function (jqXHR, textStatus, errorThrown) {

					}
				});
			}

		},

		Consultaremito: function () {
			//**********************
			var suma = 0;
			var arrp = [];
			var arrp2 = [];
			var Entrega, ent, Remito, rem, Material, mat, consulta, con;
			var Reclamoss = [];
			Entrega = oView.byId("entrega").getValue();
			Remito = oView.byId("remito").getValue();
			Material = oView.byId("material").getValue();

			consulta = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/Reclamos?$filter=';
			ent = 'ENTREGA%20eq%20%27' + Entrega + '%27';
			rem = 'REMITOLEGAL%20eq%20%27' + Remito + '%27';
			mat = 'NROPIEZA%20eq%20%27' + Material + '%27';
			con = '%20and%20';

			if (oView.byId("entrega").getValue() !== "" && oView.byId("remito").getValue() === "") {
				consulta = consulta + ent;
				if (oView.byId("remito").getValue() !== "") {
					consulta = consulta + con + rem;
				}
			} else if (oView.byId("entrega").getValue() === "" && oView.byId("remito").getValue() !== "") {
				consulta = consulta + rem;
				if (oView.byId("entrega").getValue() !== "") {
					consulta = consulta + con + ent;
				}

			}

			if (oView.byId("entrega").getValue() !== "" && oView.byId("remito").getValue() !== "") {
				consulta = consulta + ent + con + rem;
			}
			if (oView.byId("material").getValue() !== "") {
				consulta = consulta + con + mat;
			}
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'GET',
				url: appModulePath+  consulta,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					//console.log(dataR.d.results);
					Reclamoss = dataR.d.results;

					for (var a = 0; a < Reclamoss.length; a++) {
						var json3 = {
							ENTREGA: Reclamoss[a].ENTREGA,
							NROPIEZA: Reclamoss[a].NROPIEZA,
							CANTRECLAMADA: Reclamoss[a].CANTRECLAMADA

						}
						arrp.push(json3);
					}

					for (var b = 0; b < Reclamoss.length; b++) {
						if (Reclamoss[b].ID_EDO_REC !== '02') {
							////console.log(Reclamoss[b].ENTREGA);
							arrp2.push({
								ENTREGA: Reclamoss[b].ENTREGA,
								NROPIEZA: Reclamoss[b].NROPIEZA,
								CANTRECLAMADA: Number(Reclamoss[b].CANTRECLAMADA),
								PEDIDOWEB: Reclamoss[b].PEDIDOWEB
							});
						}
					}
					//console.log(arrp2);

				},
				error: function (jqXHR, textStatus, errorThrown) {
					////console.log(JSON.stringify(jqXHR));
				}
			});
			//***********
			var arr2 = [];
			var arryT = [];
			t.popCarga();
			var result = [];

			var arrn = {
				"HeaderSet": {
					"Header": {
						"Entrega": "",
						"Nav_Header_Entregas": {
							"Entregas": [{
								"Entrega": oView.byId("entrega").getValue(),
								"Remitolegal": oView.byId("remito").getValue(),
								"Material": oView.byId("material").getValue()
							}]
						}
					}
				}
			};
			result = JSON.stringify(arrn);
			////console.log(result);
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var url = appModulePath+ '/destinations/AR_DP_DEST_CPI/http/AR/DealerPortal/Reclamo/ConsultaEntregaRemito';
           
			$.ajax({
				type: 'POST',
				url: url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				data: result,
				success: function (dataR, textStatus, jqXHR) {
					t.cerrarPopCarga2();
					var datos = dataR.HeaderSet.Header.Nav_Header_Entregas.Entregas;

					if (datos.length === undefined) {
						var tpedido;
						var dia = datos.Fecharemito.substring(6, 8);
						var mes = datos.Fecharemito.substring(4, 6);
						var year = datos.Fecharemito.substring(0, 4);
						var fecha = dia + "/" + mes + "/" + year;
						datos.Fecharemito = fecha;
						var dia2 = datos.Fechafactura.substring(6, 8);
						var mes2 = datos.Fechafactura.substring(4, 6);
						var year2 = datos.Fechafactura.substring(0, 4);
						var fecha2 = dia2 + "/" + mes2 + "/" + year2;
						datos.Fechafactura = fecha2;

						if (datos.Tipopedido === "YNCI") {
							tpedido = "Pedido Inmovilizado";
						}
						if (datos.Tipopedido === "YNCS") {
							tpedido = "Pedido Stock";
						}
						if (datos.Tipopedido === "YNCU") {
							tpedido = "Pedido  Urgente";
						}
						if (datos.Tipopedido === "YNPI") {
							tpedido = "Pedido Interno";
						}

						arryT.push({
							Cantidadfacturada: Number(datos.Cantidadfacturada),
							Entrega: datos.Entrega,
							Pedidodealer: datos.Pedidodealer,
							Pedidoweb: datos.Pedidoweb,
							Fechafactura: datos.Fechafactura,
							Tipopedido: datos.Tipopedido,
							Remitolegal: datos.Remitolegal,
							Material: datos.Material,
							Descripcion: datos.Descripcion,
							Facturalegal: datos.Facturalegal,
							Fecharemito: datos.Fecharemito,
							Facturasap: datos.Facturasap,
							tiporeclamo: "",
							tpedido: tpedido,
							cantidadreclamada: "",
							ComentarioRecl: "",
							select: false,
							cantreclamo: 0,
							anexo: [],
							anexoT: []
						});
					} else {

						for (var i = 0; i < datos.length; i++) {

							var dia3 = datos[i].Fecharemito.substring(6, 8);
							var mes3 = datos[i].Fecharemito.substring(4, 6);
							var year3 = datos[i].Fecharemito.substring(0, 4);
							var fecha3 = dia3 + "/" + mes3 + "/" + year3;
							datos[i].Fecharemito = fecha3;
							var dia4 = datos[i].Fechafactura.substring(6, 8);
							var mes4 = datos[i].Fechafactura.substring(4, 6);
							var year4 = datos[i].Fechafactura.substring(0, 4);
							var fecha4 = dia4 + "/" + mes4 + "/" + year4;
							datos[i].Fechafactura = fecha4;
							if (datos[i].Tipopedido === "YNCI") {
								tpedido = "Pedido Inmovilizado";
							}
							if (datos[i].Tipopedido === "YNCS") {
								tpedido = "Pedido Stock";
							}
							if (datos[i].Tipopedido === "YNCU") {
								tpedido = "Pedido Urgente";
							}
							if (datos[i].Tipopedido === "YNPI") {
								tpedido = "Pedido Interno";
							}
							arryT.push({
								Cantidadfacturada: Number(datos[i].Cantidadfacturada),
								Entrega: datos[i].Entrega,
								Pedidodealer: datos[i].Pedidodealer,
								Pedidoweb: datos[i].Pedidoweb,
								Fechafactura: datos[i].Fechafactura,
								Tipopedido: datos[i].Tipopedido,
								Remitolegal: datos[i].Remitolegal,
								Material: datos[i].Material,
								Descripcion: datos[i].Descripcion,
								Facturalegal: datos[i].Facturalegal,
								Fecharemito: datos[i].Fecharemito,
								Facturasap: datos[i].Facturasap,
								tpedido: tpedido,
								tiporeclamo: "",
								cantidadreclamada: "",
								ComentarioRecl: "",
								select: false,
								cantreclamo: 0,
								anexo: [],
								anexoT: []

							});

						}
					}
					var arryT2 = [];

					var dataT = new sap.ui.model.json.JSONModel(arryT);
					oView.setModel(dataT, "listadoReclamo");
					//console.log(dataT);
					var suma = 0;
					for (var z = 0; z < oView.getModel("listadoReclamo").oData.length; z++) {
						for (var j = 0; j < arrp2.length; j++) {
							//console.log(oView.getModel("listadoReclamo").oData[z].Pedidoweb)
							if (arrp2[j].NROPIEZA === oView.getModel("listadoReclamo").oData[z].Material && arrp2[j].PEDIDOWEB === oView.getModel(
									"listadoReclamo").oData[z].Pedidoweb) {
								suma = suma + arrp2[j].CANTRECLAMADA;
							}

						}
						arryT2.push({
							Cantidadfacturada: oView.getModel("listadoReclamo").oData[z].Cantidadfacturada,
							Entrega: oView.getModel("listadoReclamo").oData[z].Entrega,
							Pedidodealer: oView.getModel("listadoReclamo").oData[z].Pedidodealer,
							Pedidoweb: oView.getModel("listadoReclamo").oData[z].Pedidoweb,
							Fechafactura: oView.getModel("listadoReclamo").oData[z].Fechafactura,
							Tipopedido: oView.getModel("listadoReclamo").oData[z].Tipopedido,
							Remitolegal: oView.getModel("listadoReclamo").oData[z].Remitolegal,
							Material: oView.getModel("listadoReclamo").oData[z].Material,
							Descripcion: oView.getModel("listadoReclamo").oData[z].Descripcion,
							Facturalegal: oView.getModel("listadoReclamo").oData[z].Facturalegal,
							Fecharemito: oView.getModel("listadoReclamo").oData[z].Fecharemito,
							Facturasap: oView.getModel("listadoReclamo").oData[z].Facturasap,
							tiporeclamo: oView.getModel("listadoReclamo").oData[z].tiporeclamo,
							cantidadreclamada: oView.getModel("listadoReclamo").oData[z].cantidadreclamada,
							ComentarioRecl: oView.getModel("listadoReclamo").oData[z].ComentarioRecl,
							select: oView.getModel("listadoReclamo").oData[z].select,
							cantreclamo: suma,
							tpedido: oView.getModel("listadoReclamo").oData[z].tpedido,
							anexo: oView.getModel("listadoReclamo").oData[z].anexo,
							anexoT: oView.getModel("listadoReclamo").oData[z].anexoT

						});
						suma = 0;
					}
					var dataT2 = new sap.ui.model.json.JSONModel(arryT2);
					oView.setModel(dataT2, "listadoReclamo");
					//	t.GenerarVerificado(dataR);
					////console.log(arryT2);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					////console.log(JSON.stringify(jqXHR));
					t.cerrarPopCarga2();
					////console.log(JSON.stringify(jqXHR))
					var json = {
						codigo: "500",
						descripcion: "Error de Comunicacion favor contactar a Soporte"
					};
					arr2.push(json);
					t.popError(arr2, "Error en  Creación de Reclamo")
				}
			});
		},
		verificacion: function () {
			var arr = [];
			if (Number(oView.byId("cantidadR").getValue()) + Number(oView.getModel("listadoReclamo").oData[mod].cantreclamo) > Number(oView.getModel(
					"listadoReclamo").oData[mod].Cantidadfacturada)) {
				oView.byId("cantidadR").setValue();
				var obj = {
					codigo: "05",
					descripcion: "La cantidad reclamada más la cantidad que desea reclamar supera la cantidad facturada"
				};
				arr.push(obj);
				t.popError(arr, "");

			}

		},
		handleDelete: function (oEvent) {
			var arryT = [];
			oSelectedItem = oEvent.getSource().getParent();
			var deleteT = oSelectedItem.sId.toString().substring(oSelectedItem.sId.length - 1, oSelectedItem.sId.length);
			////console.log(deleteT);
			for (var i = 0; i < oView.getModel("listadoReclamo").oData.length; i++) {
				if (i.toString() !== deleteT) {
					arryT.push({
						Cantidadfacturada: oView.getModel("listadoReclamo").oData[i].Cantidadfacturada,
						Entrega: oView.getModel("listadoReclamo").oData[i].Entrega,
						Pedidodealer: oView.getModel("listadoReclamo").oData[i].Pedidodealer,
						Pedidoweb: oView.getModel("listadoReclamo").oData[i].Pedidoweb,
						Fechafactura: oView.getModel("listadoReclamo").oData[i].Fechafactura,
						Tipopedido: oView.getModel("listadoReclamo").oData[i].Tipopedido,
						Remitolegal: oView.getModel("listadoReclamo").oData[i].Remitolegal,
						Material: oView.getModel("listadoReclamo").oData[i].Material,
						Descripcion: oView.getModel("listadoReclamo").oData[i].Descripcion,
						Facturalegal: oView.getModel("listadoReclamo").oData[i].Facturalegal,
						Fecharemito: oView.getModel("listadoReclamo").oData[i].Fecharemito,
						Facturasap: oView.getModel("listadoReclamo").oData[i].Facturasap,
						tiporeclamo: oView.getModel("listadoReclamo").oData[i].tiporeclamo,
						cantidadreclamada: oView.getModel("listadoReclamo").oData[i].cantidadreclamada,
						ComentarioRecl: oView.getModel("listadoReclamo").oData[i].ComentarioRecl,
						select: oView.getModel("listadoReclamo").oData[i].select,
						cantreclamo: oView.getModel("listadoReclamo").oData[i].cantreclamo,
						anexo: oView.getModel("listadoReclamo").oData[i].anexo,
						anexoT: oView.getModel("listadoReclamo").oData[i].anexoT
					});
				}
			}
			var dataT = new sap.ui.model.json.JSONModel(arryT);
			oView.setModel(dataT, "listadoReclamo");
			oSelectedItem = undefined;
		},
		valida: function (oEvent) {
			oSelectedItem = oEvent.getSource().getParent();
			var posicion = oSelectedItem.sId.toString().substring(oSelectedItem.sId.length - 1, oSelectedItem.sId.length);
			////console.log(posicion);
			// for (var i = 0; i < oView.getModel("listadoReclamo").oData.length; i++) {}
			////console.log(oView.getModel("listadoReclamo").oData[posicion].Cantidadfacturada);
			////console.log(oView.byId("CanRecl").getValue());
			if (oView.getModel("listadoReclamo").oData[posicion].Cantidadfacturada <= oView.byId("CanRecl").getValue()) {
				////console.log("cumple");
			} else {
				////console.log("no cumple");
			}
		},
		AgregarModificacion: function (oEvent) {

			////console.log(oView.getModel("listadoReclamo"));
			var arr = [],
				arryT = [],
				cantidad = 0,
				flag = false;

			var cmbtipoR = oView.byId("cmbtipoR").getSelectedKey();
			var cantrecl = oView.byId("cantidadR").getValue();
			var ComentarioRecl = oView.byId("comentarioR").getValue();
			if (oView.byId("cmbtipoR").getSelectedKey() === "" || oView.byId("cantidadR").getValue() === "" || oView.byId("comentarioR").getValue() ===
				"") {
				var obj = {
					codigo: "06",
					descripcion: "Los Campos MOTIVO RECLAMO , CANTIDAD RECLAMO Y DESCRIPCIÓN son Obligatorios"
				};
				arr.push(obj);
				t.popError(arr, "");
			} else {
				var datos = oView.getModel("listadoReclamo").getProperty("anexoT", oSelectedItem.getBindingContext("listadoReclamo"));

				for (var c = 0; c < datos.length; c++) {

					datos[c].codigo = this.sendFiletoCloud("/AR/DEALERPORTAL/FOTOSRECLAMO", datos[c].filename, datos[c].datafile);
				}
				oView.getModel("listadoReclamo").setProperty("anexoT", datos, oSelectedItem.getBindingContext("listadoReclamo"));

				for (var i = 0; i < oView.getModel("listadoReclamo").oData.length; i++) {
					cantidad = parseInt(oView.getModel("listadoReclamo").oData[mod].Cantidadfacturada, 10);

					if (parseInt(mod, 10) === i) {

						if (cantrecl <= cantidad) {

							flag = false;
							arryT.push({
								Cantidadfacturada: oView.getModel("listadoReclamo").oData[mod].Cantidadfacturada,
								Entrega: oView.getModel("listadoReclamo").oData[mod].Entrega,
								Pedidodealer: oView.getModel("listadoReclamo").oData[mod].Pedidodealer,
								Pedidoweb: oView.getModel("listadoReclamo").oData[mod].Pedidoweb,
								Fechafactura: oView.getModel("listadoReclamo").oData[mod].Fechafactura,
								Tipopedido: oView.getModel("listadoReclamo").oData[mod].Tipopedido,
								Remitolegal: oView.getModel("listadoReclamo").oData[mod].Remitolegal,
								Material: oView.getModel("listadoReclamo").oData[mod].Material,
								Descripcion: oView.getModel("listadoReclamo").oData[mod].Descripcion,
								Facturalegal: oView.getModel("listadoReclamo").oData[mod].Facturalegal,
								Fecharemito: oView.getModel("listadoReclamo").oData[mod].Fecharemito,
								Facturasap: oView.getModel("listadoReclamo").oData[mod].Facturasap,
								tiporeclamo: cmbtipoR,
								cantidadreclamada: cantrecl,
								ComentarioRecl: ComentarioRecl,
								select: oView.getModel("listadoReclamo").oData[mod].select,
								cantreclamo: oView.getModel("listadoReclamo").oData[i].cantreclamo,
								anexo: oView.getModel("listadoReclamo").oData[mod].anexo,
								anexoT: oView.getModel("listadoReclamo").oData[mod].anexoT

							});
						} else {
							flag = true;
							arryT.push({
								Cantidadfacturada: oView.getModel("listadoReclamo").oData[mod].Cantidadfacturada,
								Entrega: oView.getModel("listadoReclamo").oData[mod].Entrega,
								Pedidodealer: oView.getModel("listadoReclamo").oData[mod].Pedidodealer,
								Pedidoweb: oView.getModel("listadoReclamo").oData[mod].Pedidoweb,
								Fechafactura: oView.getModel("listadoReclamo").oData[mod].Fechafactura,
								Tipopedido: oView.getModel("listadoReclamo").oData[mod].Tipopedido,
								Remitolegal: oView.getModel("listadoReclamo").oData[mod].Remitolegal,
								Material: oView.getModel("listadoReclamo").oData[mod].Material,
								Descripcion: oView.getModel("listadoReclamo").oData[mod].Descripcion,
								Facturalegal: oView.getModel("listadoReclamo").oData[mod].Facturalegal,
								Fecharemito: oView.getModel("listadoReclamo").oData[mod].Fecharemito,
								Facturasap: oView.getModel("listadoReclamo").oData[mod].Facturasap,
								tiporeclamo: "",
								cantidadreclamada: "",
								ComentarioRecl: "",
								select: oView.getModel("listadoReclamo").oData[mod].select,
								cantreclamo: oView.getModel("listadoReclamo").oData[i].cantreclamo,
								anexo: oView.getModel("listadoReclamo").oData[mod].anexo,
								anexoT: oView.getModel("listadoReclamo").oData[mod].anexoT
							});
						}
					} else {
						// flag = false;
						arryT.push({
							Cantidadfacturada: oView.getModel("listadoReclamo").oData[i].Cantidadfacturada,
							Entrega: oView.getModel("listadoReclamo").oData[i].Entrega,
							Pedidodealer: oView.getModel("listadoReclamo").oData[i].Pedidodealer,
							Pedidoweb: oView.getModel("listadoReclamo").oData[i].Pedidoweb,
							Fechafactura: oView.getModel("listadoReclamo").oData[i].Fechafactura,
							Tipopedido: oView.getModel("listadoReclamo").oData[i].Tipopedido,
							Remitolegal: oView.getModel("listadoReclamo").oData[i].Remitolegal,
							Material: oView.getModel("listadoReclamo").oData[i].Material,
							Descripcion: oView.getModel("listadoReclamo").oData[i].Descripcion,
							Facturalegal: oView.getModel("listadoReclamo").oData[i].Facturalegal,
							Fecharemito: oView.getModel("listadoReclamo").oData[i].Fecharemito,
							Facturasap: oView.getModel("listadoReclamo").oData[i].Facturasap,
							tiporeclamo: oView.getModel("listadoReclamo").oData[i].tiporeclamo,
							cantidadreclamada: oView.getModel("listadoReclamo").oData[i].cantidadreclamada,
							ComentarioRecl: oView.getModel("listadoReclamo").oData[i].ComentarioRecl,
							select: oView.getModel("listadoReclamo").oData[i].select,
							cantreclamo: oView.getModel("listadoReclamo").oData[i].cantreclamo,
							anexo: oView.getModel("listadoReclamo").oData[i].anexo,
							anexoT: oView.getModel("listadoReclamo").oData[i].anexoT

						});
					}

				}

				if (flag) {
					var obj = {
						codigo: "400",
						descripcion: "Esta pieza ya tiene un reclamo para toda la cantidad entregada "
					};
					arr.push(obj);
					t.popError(arr, "Error de Comunicacion");
					mod = "";

				} else {
					mod = "";
				}
				var dataT = new sap.ui.model.json.JSONModel(arryT);
				oView.setModel(dataT, "listadoReclamo");
				t.CerrarModificar();
				oSelectedItem = undefined;
				arryT = [];
				flag = "";
				oView.byId("cmbtipoR").setSelectedKey();
				oView.byId("cantidadR").setValue();
				oView.byId("comentarioR").setValue();
				this.byId("uploadCollection").destroyItems();

			}
		},
		press: function (oEvent) {
			var json55 = [];
			var json = [];
			//	////console.log(oEvent.getSource().getParent().mAggregations.content[0]);
			var dato = oEvent.getSource().getParent().mAggregations.content[0]._aSelectedPaths;
			for (var i = 0; i < dato.length; i++) {
				var oSelectedItem2 = dato[i];
				oSelectedItem2 = parseInt(oSelectedItem2.replace(/\//g, ""), 10);
				json.push(oSelectedItem2);
			}

			for (var j = 0; j < json.length; j++) {
				oView.getModel("listadoReclamo").oData[j]
				json55.push(oView.getModel("listadoReclamo").oData[j]);

				////console.log(json55);
			}
			////console.log(json55);
		},
		handleValueHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment("AR_DP_ADMIN_CREACIONRECLAMO_RASA.AR_DP_ADMIN_CREACIONRECLAMO_RASA.view.Dialog",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			this._valueHelpDialog.open(sInputValue);
		},
		popCarga: function () {

			var oDialog = oView.byId("indicadorCarga");

			if (!oDialog) {

				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_ADMIN_CREACIONRECLAMO_RASA.AR_DP_ADMIN_CREACIONRECLAMO_RASA.view.PopUp", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();

		},
		cerrarPopCarga2: function () {
			oView.byId("indicadorCarga").close();
		},
		Modificar: function (oEvent) {
			oSelectedItem = oEvent.getSource().getParent();
			mod = oSelectedItem.oBindingContexts.listadoReclamo.sPath.replace(/\//g, "");
			if (Number(oView.getModel("listadoReclamo").oData[mod].cantreclamo) >= Number(oView.getModel("listadoReclamo").oData[mod].Cantidadfacturada)) {
				var arr = [];
				var obj = {
					codigo: "05",
					descripcion: "Esta pieza ya tiene reclamo por toda la unidad entregada"
				};
				arr.push(obj);
				t.popError(arr, "");
				mod = "";
			} else {
				var oDialog = oView.byId("GReclamo");

				if (!oDialog) {

					oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_ADMIN_CREACIONRECLAMO_RASA.AR_DP_ADMIN_CREACIONRECLAMO_RASA.view.Modificar", this);
					oView.addDependent(oDialog);
				}
				oDialog.open();
				for (var i = 0; i < itemUploadCollection.length; i++) {
					try {
						// itemUploadCollection[i].sId = itemUploadCollection[i].sId + "b";
						//console.log(oView.getModel("listadoReclamo").getProperty("Pedidoweb", oSelectedItem.getBindingContext("listadoReclamo")));
						//console.log(oView.getModel("listadoReclamo").getProperty("Material", oSelectedItem.getBindingContext("listadoReclamo")));
						//console.log(itemUploadCollection[i].Material);
						//console.log(itemUploadCollection[i].Pedidoweb);
						//console.log(itemUploadCollection[i]);
						if (oView.getModel("listadoReclamo").getProperty("Material", oSelectedItem.getBindingContext("listadoReclamo")) ===
							itemUploadCollection[i].Material &&
							oView.getModel("listadoReclamo").getProperty("Pedidoweb", oSelectedItem.getBindingContext("listadoReclamo")) ===
							itemUploadCollection[i].Pedidoweb) {

							this.byId("uploadCollection").addItem(itemUploadCollection[i].file);
						}
					} catch (e) {
						////console.warn(e);
						////console.log(itemUploadCollection[i]);
					}
				}
				//console.log(oView.getModel("listadoReclamo").oData);
				//console.log(itemUploadCollection);
				if (oView.getModel("listadoReclamo").oData[mod].tiporeclamo !== "") {
					////console.log("si entro");
					oView.byId("cmbtipoR").setSelectedKey(oView.getModel("listadoReclamo").oData[mod].tiporeclamo);
					oView.byId("cantidadR").setValue(oView.getModel("listadoReclamo").oData[mod].cantidadreclamada);
					oView.byId("comentarioR").setValue(oView.getModel("listadoReclamo").oData[mod].ComentarioRecl);
				} else {
					oView.byId("cmbtipoR").setSelectedKey();
					oView.byId("cantidadR").setValue();
					oView.byId("comentarioR").setValue();
				}

			}

		},
		CerrarModificar: function () {
			t.validarExistenciaAnexo();

			oView.byId("GReclamo").close();
			mod = "";

			this.byId("uploadCollection").removeAllItems();

		},
		popSucces: function (obj, titulo) {
			var oDialog = oView.byId("dialogSucces");
			var log = new sap.ui.model.json.JSONModel(obj);
			oView.setModel(log, "Succes");

			if (!oDialog) {

				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_ADMIN_CREACIONRECLAMO_RASA.AR_DP_ADMIN_CREACIONRECLAMO_RASA.view.Succes", this);
				oView.addDependent(oDialog);
			}
			oView.byId("dialogSucces").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
			oView.byId("dialogSucces").setTitle("Succes: " + titulo);

		},
		cerrarPopSucces: function () {
			oView.byId("dialogSucces").close();
			arrmensaje = [];
			t.limpiar();

		},
		limpiar: function () {
			oView.byId("entrega").setValue();
			oView.byId("remito").setValue();
			oView.byId("material").setValue();
			var arr = [];
			var material = new sap.ui.model.json.JSONModel(arr);
			itemUploadCollection = [];
			oView.setModel(material, "listadoReclamo");

		},
		popError: function (obj, titulo) {
			var log = new sap.ui.model.json.JSONModel(obj);
			oView.setModel(log, "error");
			var oDialog = oView.byId("dialogError");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_ADMIN_CREACIONRECLAMO_RASA.AR_DP_ADMIN_CREACIONRECLAMO_RASA.view.Error", this);
				oView.addDependent(oDialog);
			}
			oView.byId("dialogError").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
			oView.byId("dialogError").setTitle("Error: " + titulo);
			//	oView.byId("dialogError").setState("Error");
		},
		cerrarPopError: function () {
			oView.byId("dialogError").close();

		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"Name",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		onSalir: function () {
			envio = [];
			t.eliminarcionsobrantes({
				anexoT: []
			});
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: "#"
				}
			});
		},

		_handleValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = this.byId(this.inputId);
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},
		onDialogBuilder: function () {
			////console.log(this.getOwnerComponent().getModel("DocModel").getProperty("/selected"));

			var oDialog = new sap.m.Dialog({
				noDataText: "No hay items",
				title: "Cargar Archivo",
				content: this.getFragment("oDisplFrag", "addFile", [null, null]),
				beginButton: new sap.m.Button({
					text: "Guardar",
					press: function (oEvent) {

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Cerrar",
					press: function (oEvent) {
						oDialog.close();

					}
				}),
				afterClose: function () {
					oDialog.destroyAggregation();
					sap.ui.getCore().byId("uploadCollection").destroyItems();
					sap.ui.getCore().byId("prob_inp_crea_doc").setValue("");

				}
			}).addStyleClass("sapUiContentPadding");

			this.getView().addDependent(oDialog);
			oDialog.open();
		},

		getFragment: function (oVar, sID, oModel) {
			if (!this[oVar]) {
				this[oVar] = sap.ui.xmlfragment("AR_DP_ADMIN_CREACIONRECLAMO_RASA.AR_DP_ADMIN_CREACIONRECLAMO_RASA.view." + sID, this);

				this.getView().addDependent(this[oVar]);
			}
			return this[oVar];
		},
		sendFiletoCloud: function (folderName, fileName, file) {

			var formData = new FormData();

			formData.append("propertyId[0]", "cmis:name");
			formData.append("propertyValue[0]", fileName);
			formData.append("cmisaction", "createDocument");
			formData.append("propertyId[1]", "cmis:objectTypeId");
			formData.append("propertyValue[1]", "cmis:document");
			formData.append("datafile", file);

			var idReturn;
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			jQuery.ajax(appModulePath+ "/DSNissan_Repositorio/folderPath/AR&DEALERPORTAL&FOTOSRECLAMO", {
				type: "POST",
				data: formData,
				cache: false,
				processData: false,
				contentType: false,
				async: false,
				success: function (data) {
					idReturn = data.properties["cmis:objectId"].value;

				}.bind(this),
				error: function (data) {
					/*this.viewFlowRoutine({
						busy: false
					});*/
					// this.resetDataCrea();
					sap.m.MessageBox.show("Hubo un error en la operación", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Operación Erronea.",
						actions: sap.m.MessageBox.Action.CLOSE
					});
				}.bind(this)
			});

			return idReturn;
		},
		_setDocProperty: function (sPath, sValue) {
			var oModel = this.getOwnerComponent().getModel("DocModel");
			oModel.setProperty(sPath, sValue);
			oModel.refresh(true);
		},
		createDocuments: function (oData) {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var oModel = new ODataModel(appModulePath+ "/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata");
			oModel.create("/Foto", oData, {
				success: function (oEvent) {

					this.readDocuments();
					this.resetDataCrea();
					/*this.viewFlowRoutine({
						busy: false
					});*/
					sap.m.MessageBox.show("Se ha cargado correctamente.", {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Operación Exitosa.",
						actions: sap.m.MessageBox.Action.CLOSE
					});
				}.bind(this),
				error: function (oEvent) {
					//	debugger;
				}
			});
		},
		onSubirArchivo: function (oEvent) {

			var oUploadCollection = this.byId("uploadCollection");

			var cFiles = oUploadCollection.getItems().length;
			var uploadInfo = cFiles + " file(s)",
				flag = true;
			////console.log(oUploadCollection);

			////console.log(cFiles);
			////console.log(uploadInfo);
			var modelo = oView.getModel("listadoReclamo").oData;

			// 0145200571
			//console.log(oEvent.getParameters().files);
			var dato = oEvent.getParameters().files;
			for (var x = 0; x < dato.length; x++) {
				//console.log(dato[x].size);

				if (dato[x].size > 10485760) {
					sap.m.MessageBox.show("El Tamaño MAXIMO es de 10MB", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Operación Erronea.",
						actions: sap.m.MessageBox.Action.CLOSE
					});
					//console.log(this.byId("UploadCollection").getsItems());
					flag = false;
				}
			}
			var contador = oView.getModel("listadoReclamo").getProperty("anexoT", oSelectedItem.getBindingContext("listadoReclamo"));
			if (contador.length + oEvent.getParameters().files.length > 6) {
				sap.m.MessageBox.show("No se puede cargar mas de 6 archivos a la vez", {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Operación Erronea.",
					actions: sap.m.MessageBox.Action.CLOSE
				});
				flag = false;
				//console.log(oView.getModel("listadoReclamo").oData)
				//console.log(this.byId("UploadCollection").getItems());
			}
			if (flag) {
				t.validarExistenciaAnexo();
				var json2 = [];
				for (var x = 0; x < oEvent.getParameters().files.length; x++) {
					json2.push({
							filename: new Date().getTime() + "_" +
								oEvent.getParameters().files[x].name,
							datafile: oEvent.getParameters().files[x],
							codigo: ""
						}
						// 
					);
				}
				for (var x = 0; x < contador.length; x++) {
					json2.push(
						contador[x]
					);
				}
				oView.getModel("listadoReclamo").setProperty("anexoT", json2, oSelectedItem.getBindingContext(
					"listadoReclamo"));
				////console.log(oView.getModel("listadoReclamo").oData);
			}
		},
		onFileDeleted: function (oEvent) {
			////console.log(oEvent);
		},
		onFileSizeExceed: function (oEvent) {
			// MessageToast.show("Event fileSizeExceed triggered");
			sap.m.MessageBox.show("Excede el Tamaño MAXIMO de 150KB", {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: "Operación Erronea.",
				actions: sap.m.MessageBox.Action.CLOSE
			});
		},
		validarExistenciaAnexo: function () {
			var fileT = this.byId("uploadCollection").getItems(),
				flag = false,
				itemT = [],
				anexoT2 = [],
				anexoT = oView.getModel("listadoReclamo").getProperty("anexoT", oSelectedItem.getBindingContext("listadoReclamo")),
				matT = oView.getModel("listadoReclamo").getProperty("Material", oSelectedItem.getBindingContext("listadoReclamo")),
				pedidoweb = oView.getModel("listadoReclamo").getProperty("Pedidoweb", oSelectedItem.getBindingContext("listadoReclamo"));
			for (var i = 0; i < itemUploadCollection.length; i++) {
				console.log(itemUploadCollection[i].Material !== matT && itemUploadCollection[i].Pedidoweb !== pedidoweb);
				console.log(itemUploadCollection[i].Material);
				console.log(matT);
				console.log(itemUploadCollection[i].Pedidoweb);
				console.log(pedidoweb);

				if (itemUploadCollection[i].Material !== matT || itemUploadCollection[i].Pedidoweb !== pedidoweb) {
					flag = true;
				}
				if (flag) {
					itemT.push(itemUploadCollection[i]);
					flag = false;
				}
			}

			// //console.log(itemT);
			// //console.log(itemUploadCollection);			
			for (var i = 0; i < fileT.length; i++) {
				for (var j = 0; j < anexoT.length; j++) {
					if (anexoT[j].filename.toString().substring(14, anexoT[j].filename.length) === fileT[i].getFileName()) {
						flag = true;
					}
				}
				if (flag) {
					itemT.push({
						file: fileT[i],
						Material: matT,
						Pedidoweb: pedidoweb
					});
					flag = false;
				}
			}
			console.log(itemT);
			for (var i = 0; i < itemT.length; i++) {
				for (var j = 0; j < anexoT.length; j++) {
					if (itemT[i].Material === matT && itemT[i].Pedidoweb === pedidoweb) {
						if (itemT[i].file.getFileName() === anexoT[j].filename.toString().substring(14, anexoT[j].filename.length)) {
							anexoT2.push(anexoT[j]);
						}
					}
				}
			}
			oView.getModel("listadoReclamo").setProperty("anexoT", anexoT2, oSelectedItem.getBindingContext(
				"listadoReclamo"));
			itemUploadCollection = itemT;
		},

		fndetele: function (file) {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			jQuery.ajax(appModulePath+ "/DSNissan_Repositorio/delete/filename/" + file + "?cmisaction=delete", {
				type: "POST",
				//	data: formData,
				cache: false,
				processData: false,
				contentType: false,
				async: false,
				success: function (data) {
					////console.log("eliminado 1")

				}.bind(this),
				error: function (data) {

				}.bind(this)
			});
		},

		fndetele2: function () {
			var arr = ['1601498844406_descarga.png', '1601498828014_descarga.png', '1601498810980_descarga.png'];
			for (var x = 0; x < arr.length; x++) {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
				jQuery.ajax(appModulePath+ "/DSNissan_Repositorio/delete/filename/" + arr[x] + "?cmisaction=delete", {
					type: "POST",
					//	data: formData,
					cache: false,
					processData: false,
					contentType: false,
					async: false,
					success: function (data) {
						////console.log("eliminado 1")

					}.bind(this),
					error: function (data) {

					}.bind(this)
				});
			}
		},
		limpiarr: function () {
			this.byId("uploadCollection").destroyItems();

		},
		contadorcaracteres: function () {
		
			if (oView.byId("comentarioR").getValue().length === 200) {
			
				this.handleMessageToastPress();
			}
		},
		handleMessageToastPress: function (oEvent) {
			var msg = 'Ha ocupado el máximo de caracteres permitido.';
			MessageToast.show(msg);
		}

	});
});