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
    public partial class NuevoPsicologo : Form
    {
        private ControladorPsicologo controlador;
        public NuevoPsicologo()
        {
            InitializeComponent();
            controlador = new ControladorPsicologo();

        }

        private void button2_Click(object sender, EventArgs e)
        {
            string sexoSeleccionado = radioButtonM.Checked ? "Masculino" : (radioButtonF.Checked ? "Femenino" : string.Empty);

            if (String.IsNullOrEmpty(sexoSeleccionado)) { 
            
            }
            var nuevoPsicologo = new Cpsicologo
            {
                nombres = txtNombre.Text,
                aPaterno = txtAP.Text,
                aMaterno = txtAM.Text,
                sexo = sexoSeleccionado,
                numeroTelefono = txtTelefono.Text,
                correoInstitucional = txtCorreo.Text,
                fechaNacimiento = dateTimePickerNacimiento.Value,
                nombreUsuario = txtUsuario.Text,
                clave = txtClave.Text
            };

            if (controlador.AgregarPsicologo(nuevoPsicologo))
            {
                MessageBox.Show("Usuario agregado exitosamente.");
                this.Close();
            }
            else
            {
                MessageBox.Show("Error al agregar Usuario.");
            }
        }

        private void pictureBox2_Click(object sender, EventArgs e)
        {

        }

        private void label1_Click(object sender, EventArgs e)
        {

        }

        private void button1_Click(object sender, EventArgs e)
        {
            txtNombre.Text = "";
            txtAP.Text="";
            txtAM.Text = "";
            txtTelefono.Text = "";
            txtCorreo.Text = "";
            txtUsuario.Text = "";
            txtClave.Text = "";


        }

        private void NuevoPsicologo_Load(object sender, EventArgs e)
        {

        }
    }
}
