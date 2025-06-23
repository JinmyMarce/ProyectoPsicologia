using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Modelo;
using Controlador;

namespace Vista
{
    public partial class Reporte : Form
    {
        private ControladorReporte controladorReporte;
        public Reporte()
        {
            InitializeComponent();
            controladorReporte = new ControladorReporte();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            Creporte nuevoRepote = new Creporte()
            {
                descripcion = richTextBoxDescrip.Text.Trim()
            };

            try
            {
                if (controladorReporte.RegistrarRepote(nuevoRepote))
                {
                    MessageBox.Show("Repote registrado exitosamente.");
                    LimpiarCampos();
                }
                else
                {
                    MessageBox.Show("Error al registrar el repote. Verifique los datos ingresados.");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error al intentar registrar repote: {ex.Message}");
                Console.WriteLine($"Error general al registrar el repote: {ex.Message}");
            }
        }

        private void LimpiarCampos()
        {
            richTextBoxDescrip.Text = "";
        }

        private void Reporte_Load(object sender, EventArgs e)
        {

        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {
            MDIParent1 Me = new MDIParent1();
            Me.Show();
            this.Hide();
        }
    }
    }

