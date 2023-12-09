
//se crea una variable global para almacenar los productos adquiridos por el cliente
const factura = { fecha: new Date().toLocaleDateString() , cliente : '' , total:0, total_iva:0 , productos: [] , efectivo : 0 , cambio:0 };
let productos = [];
//Valores de configuración para la consulta del API
const binId = '6574a96d12a5d37659a57e8f'
const apiKey ='$2a$10$fKr87JmOECcf4wErg7Equu3xBut0aGHXkyZR7PVcrPDOjlcXjubaa'
const url = `https://api.jsonbin.io/v3/b/${binId}`
const headers = {
  'secret-key': apiKey
}

// se llama a la función para mostrar los productos en la vista
listarProductos();
function listarProductos (){
  //Listar los productos que estan el API
  fetch(url,{headers})
  .then(response => response.json())
  .then(data => {
      productos = data.record
      cargarProductos()
  })
}

//Cargamos los productos obtenidos en el API en la tabla
function cargarProductos(){
  let div = document.getElementById("productosTienda");
  let body = '<table style="margin-left: 8px;" class="table table-striped table-bordered"><thead><tr><th scope="col">Nombre</th><th scope="col">Stock</th><th scope="col">Precio</th></tr></thead><tbody id="bodyproducto">';
  productos.forEach(producto =>{
      body += "<tr><td>" + producto.nombre + "</td>" +
      "<td>" + producto.cantidad + "</td>" +
      "<td>" + formatterPeso(producto.precio) + "</td>";
  });
  body+='</tbody></table>'
  div.innerHTML = body;
}
 //Se obtiene el elemento boton del html
let agregarProducto = document.getElementById("agregarProducto")
let finalizarCompra = document.getElementById("finalizarCompra")

//Ejecutar evento cuando se de click al boton agregar producto
agregarProducto.onclick = () =>{
  addProduct();
}

//Función para añadir productos y validar datos erroneos o no ingresados
function addProduct ()
{
  let nomproducto = document.getElementById("producto").value;
  let cantidad = document.getElementById("cantidad").value;
  if (nomproducto == "" || nomproducto == null) {
    mensaje("Error","error","¡Debe ingresar un producto!")
  }else if (cantidad == 0 || cantidad == "" || cantidad == null){
    mensaje("Error","error","¡Debe ingresar un cantidad del producto a llevar!")
  }else{
    let producto = productos.find((producto)=> producto.nombre.toLowerCase() == nomproducto.toLowerCase());
    if (producto == undefined) {
      mensaje("Error","error","¡El nombre del producto ingresado no se encuentra registrado!")
    } else {
      //LLamado de la función validarStock
      validarStock(producto,cantidad);    
    }
  }
}

//Función para validar Stock de los productos
function validarStock(producto,cantidad){
  if(producto.cantidad >= cantidad){
      producto.cantidad -= cantidad;
      cargarProductos();
      //se llama a la funcion y se le pasa el valor que selecciono el usuario
      calcularValor(producto,cantidad);
  }else{
    mensaje("Error","error","¡La cantidad ingresada supera el stock del producto!")
  }
}

//Función para formatear los valores numericos a peso Colombiano.
function formatterPeso(value) {
  const result = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
  return result;
}

//Función para calcular el precio de los productos ingresados por el cliente y guardarlos en la variable global de factura
function calcularValor(producto,iCantidad){
  const precioProducto = producto.precio * iCantidad;
//Función para  agregar el iva a los productos
  let iva = precioProducto * 0.19;
  let iva19 = precioProducto - iva;
  factura.total += precioProducto;
  factura.total_iva += iva;
 //Función para agregar los atributos de nombre,cantidad,precio total,iva y producto mas iva a la factura. 
  factura.productos.push({
    nombre: producto.nombre,
    valor_Unitario: producto.precio,
    cantidad: iCantidad,
    precio_Total: precioProducto,
    valor_Iva: iva,
    precio_Sin_Iva: iva19,
  });
  mensaje("Éxito","success","¡Producto Agregado exitosamente!")
}

//Función para finalizar la compra y pedir los datos del usuario 
finalizarCompra.onclick = () =>{
  let cantidadP = factura.productos.length;
  if(cantidadP >0){
    Swal.fire({
      title: "¿Estas seguro?",
      text: "¿Desea finalizar la compra?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Estoy seguro!"
    }).then((result) => {
      if (result.isConfirmed) {
        pedirDatosClientes();
      }
    });
  }else{
    mensaje("Error","error","¡Debe agregar los productos a comprar!")
  }
}

//Agregar inputs de cliente y efectivo al html
function pedirDatosClientes(){
  agregarProducto.disabled = true;
  let div = document.getElementById("datosFactura");
  let body = "<div class='col col-lg-10'><label class='form-label'>Nombre del Cliente</label>"+
  "<input type='text' class='form-control' id='nombre'></div><br></div>"+
  "<div class='col-lg-10'><label class='form-label'>Efectivo</label>"+
  "<input type='number' class='form-control' id='efectivo'></div><br>"+
  "<span> Valor de la factura <b>"+formatterPeso(factura.total)+"</b></span> <br><br><button onclick='datosFactura()' type='button' class='btn btn-primary'>Generar Factura</button>"+"";
  div.innerHTML=body;
}

//Funcion para validar los datos del cliente y el efectivo
function datosFactura(){
  let nombreC = document.getElementById("nombre").value;
  let efectivo = document.getElementById("efectivo").value;

  if(nombreC =="" || nombreC==null ){
    mensaje("Error","error","¡Debe ingresar el nombre del cliente!")
  }else if(efectivo==0 || efectivo == "" || efectivo ==null){
    mensaje("Error","error","¡Debe ingresar el efectivo!")
  }else{
      //Validar efectivo
      validarEfectivo(efectivo,nombreC);
  }
}

//Función de validación de efectivo ingresado por el cliente
function validarEfectivo(efectivo,nombreC) {
  let total = parseFloat(factura.total);
    if(efectivo < total){
      mensaje("Error","error","¡Dinero insuficiente!")
    }else{
        let cambio = efectivo-total;
        factura["efectivo"] = efectivo;
        factura["cambio"] = cambio;
        factura["cliente"] = nombreC;
        totalCompra();
    }
    
}

//Funcion para crear una tabla y llenarla con los porudctos adquiridos por el usuario
function totalCompra() {
  let productos = factura.productos;
  let div = document.getElementById("factura");
  let div2 = document.getElementById("Tablas");
  let item = '<br><h2>RESUMEN COMPRA</h2><div class="row"><div class="col-lg-6"><h5>Fecha : <b>'+ factura.fecha +'</b></h5></div><div class="col-lg-6"><h5> Cliente: <b>'+factura.cliente +'</b></h5></div></div><br><div class="row"><div class="col-lg-6"><h5>Efectivo : <b>'+formatterPeso(factura.efectivo) +'</b></h5></div>'+
  '<div class="col-lg-6"><h5>Cambio : <b>'+formatterPeso(factura.cambio) +'</b></h5></div></div> ';
  div.innerHTML = item;
  let itemTablas = '<table class="table table-striped table-bordered"><thead><tr><th>Producto</th><th>V/Unidad</th><th>Cantidad</th><th>Valor</th></tr></thead><tbody id="bodyFactura">';
  let body = "";
  let body2 = "";

  // se recorren los diferentes productos para colocarlos en la tabla de productos e iva 
  productos.forEach(function (producto) {
    body += "<tr><td>" + producto.nombre + "</td><td>" +
    formatterPeso(producto.valor_Unitario) +    "</td><td>" +
    producto.cantidad + "</td><td>" +
    formatterPeso(producto.precio_Total) +  "</td></tr>";
    body2 += "<tr><td>" +  producto.nombre + "</td><td>" + formatterPeso(producto.precio_Total) + "</td><td>" + formatterPeso(producto.precio_Sin_Iva) + "</td><td>" + formatterPeso(producto.valor_Iva) + "</td></tr>"; 

});

  itemTablas += body+'</tbody><tfoot><tr><th colspan="3" style="text-align: right;">TOTAL</th><td id="totalFactura">' + 
  formatterPeso(factura.total)+"</td></tr></tfoot></table>";

  itemTablas +="<h2>RESUMEN IMPUESTOS</h2>" +
  '<table class="table table-striped table-bordered"><thead><tr><th>Producto</th><th>V/Total</th><th>Base</th><th>Iva</th></tr></thead><tbody id="bodyImpuestos">'+body2+'</tbody><tfoot><tr><th colspan="3" style="text-align: right;">TOTAL</th><td id="totalFactura">' + formatterPeso(factura.total_iva)+ "</td></tr></tfoot></table>";

  div2.innerHTML = itemTablas;

}
function mensaje (title,icon,text) {
  Swal.fire({
    icon: icon,
    title: title,
    text: text,
  });
}