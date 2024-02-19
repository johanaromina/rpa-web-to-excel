const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

async function main() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Ir a la página 
    await page.goto('https://21.edu.ar/');

    // Esperar a que se carguen las imágenes y contar la cantidad de botones
    await Promise.all([
        page.waitForSelector('img'), 
        page.waitForSelector('button'), 
    ]);

    // Esperar un tiempo adicional después de que se hayan cargado las imágenes y los botones
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Contar la cantidad de imágenes y botones después de esperar
    const cantidadImagenes = (await page.$$('img')).length;
    const cantidadBotones = (await page.$$('button')).length;

    // Recorrer y hacer clic en cada botón
    const botones = await page.$$('button');
    for (const boton of botones) {
        // Verificar si el botón es interactuable antes de hacer clic en él
        const isInteractable = await boton.isIntersectingViewport();
        if (isInteractable) {
            await boton.click();
            console.log('Se hizo clic en el botón:', boton);
        } else {
            console.log('El botón no es interactuable:', boton);
        }
        // Esperar un breve tiempo después de hacer clic en el botón
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Esperar un tiempo adicional después de hacer clic en todos los botones
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verificar que todas las imágenes estén cargadas correctamente
    const imagenesCargadas = await page.evaluate(() => {
        const imagenes = Array.from(document.querySelectorAll('img'));
        return imagenes.every(imagen => imagen.complete);
    });

    // Crear un archivo Excel y guardar los resultados
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resultados');

    // Agregar los resultados al archivo Excel
    worksheet.addRow({ 'Cargas de imágenes correctas': imagenesCargadas ? 'Sí' : 'No' });
    worksheet.addRow({ 'Clickeos de botones correctos': 'Sí' });
    worksheet.addRow({ 'Cantidad de imágenes en la página': cantidadImagenes });
    worksheet.addRow({ 'Cantidad de botones en la página': cantidadBotones });

    // Guardar el archivo Excel
    await workbook.xlsx.writeFile('resultados.xlsx');

    console.log('Proceso completado');

    // Cerrar el navegador
    await browser.close();
}

main().catch(console.error);
