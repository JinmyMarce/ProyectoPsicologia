using Controlador;
using Modelo;
using System;
using System.Collections.Generic;
using System.IO;
using iTextSharp;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Vista
{
    public partial class VisializarErrores : Form
    {
        private ControladorReporte controladorReporte;
        private List<Creporte> reportes;
        public VisializarErrores()
        {
            InitializeComponent();
            controladorReporte = new ControladorReporte();
            
        }
        private void CargarReportes()
        {
            reportes = controladorReporte.ListarRepotes();
            dataGridView1.DataSource = reportes;
            dataGridView1.Columns["Id"].ReadOnly = true;
        }


        private void VisializarErrores_Load(object sender, EventArgs e)
        {
            CargarReportes();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            if (dataGridView1.SelectedRows.Count > 0)
            {
                int idReporte = Convert.ToInt32(dataGridView1.SelectedRows[0].Cells["Id"].Value);
                if (controladorReporte.EliminarReporte(idReporte))
                {
                    MessageBox.Show("Reporte de error eliminado correctamente.", "Eliminar Reporte", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    CargarReportes();
                }
                else
                {
                    MessageBox.Show("Error al eliminar el reporte de error.", "Eliminar Reporte", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            else
            {
                MessageBox.Show("Seleccione un reporte de error para eliminar.", "Eliminar Reporte", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {
            // Ruta donde se guardará el archivo PDF
            string nombreArchivo = "Reporte.pdf";
            string rutaArchivo = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), nombreArchivo);

            // Creación del documento PDF
            using (PdfWriter writer = new PdfWriter(rutaArchivo))
            {
                using (PdfDocument pdf = new PdfDocument(writer))
                {
                    Document document = new Document(pdf);

                    // Agregar título
                    Paragraph title = new Paragraph("Reporte de Reportes")
                        .SetTextAlignment(iText.Layout.Properties.TextAlignment.CENTER)
                        .SetFontSize(20);
                    document.Add(title);

                    // Agregar tabla con los datos de los reportes
                    Table table = new Table(2); // 2 columnas: Id y Descripción
                    table.AddHeaderCell("Id");
                    table.AddHeaderCell("Descripción");

                    foreach (Creporte reporte in reportes)
                    {
                        table.AddCell(reporte.Id.ToString());
                        table.AddCell(reporte.descripcion);
                    }

                    document.Add(table);

                    // Cerrar el documento
                    document.Close();
                }
            }

            MessageBox.Show($"Se ha generado el archivo PDF en {rutaArchivo}", "Informe PDF Generado", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private void pictureBox2_Click(object sender, EventArgs e)
        {
            MDIParent1 menu=new MDIParent1();
            menu.Show();
        }

        private void label1_Click(object sender, EventArgs e)
        {

        }
    }
    }

    

