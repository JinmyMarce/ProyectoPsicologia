using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using PdfiumViewer;
using System.IO;

namespace Vista
{
    public partial class Guia : Form
    {
        private PdfViewer pdfViewer;
        public Guia()
        {
            InitializeComponent();
            pdfViewer = new PdfViewer();
            Controls.Add(pdfViewer);
            pdfViewer.Dock = DockStyle.Fill;
        }

        private void Guia_Load(object sender, EventArgs e)
        {
            MostrarPDF();
        }
        private void MostrarPDF()
        {
            try
            {
                string nombreArchivo = "Manual de ayuda.pdf";
                string directorioActual = AppDomain.CurrentDomain.BaseDirectory;
                string rutaCompleta = Path.Combine(directorioActual, "PDFs", nombreArchivo);

                if (File.Exists(rutaCompleta))
                {
                    pdfViewer.Document = PdfDocument.Load(rutaCompleta);
                }
                else
                {
                    MessageBox.Show($"No se pudo encontrar el archivo PDF: {nombreArchivo}");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error al cargar el PDF: {ex.Message}");
            }
        }
        private void MostrarPDFDesdeRecurso()
        {
            try
            {
                using (Stream pdfStream = GetType().Assembly.GetManifestResourceStream("NombreDeTuProyecto.PDFs.Manual de ayuda.pdf"))
                {
                    if (pdfStream != null)
                    {
                        pdfViewer.Document = PdfDocument.Load(pdfStream);
                    }
                    else
                    {
                        MessageBox.Show("No se pudo cargar el archivo PDF embebido.");
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error al cargar el PDF: {ex.Message}");
            }
        }

    }
}
