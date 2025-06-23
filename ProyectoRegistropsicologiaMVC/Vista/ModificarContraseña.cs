using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Controlador;

namespace Vista
{
    public partial class ModificarContraseña : Form
    {
       

        private ControladorPsicologo controlador;
        

        public ModificarContraseña()
        {
            InitializeComponent();
           
            controlador = new ControladorPsicologo();
        }
        public void SetNombreUsuario(string nombreUsuario)
        {
            txtUsuario.Text = nombreUsuario; // Establecer el nombre de usuario en el TextBox
        }

        private void button2_Click(object sender, EventArgs e)
        {

            string nombreUsuario = txtUsuario.Text;
            string nuevaContraseña = txtClave.Text;

            // Validar que las contraseñas coincidan
            if (string.IsNullOrEmpty(nombreUsuario) || string.IsNullOrEmpty(nuevaContraseña))
            {
                MessageBox.Show("Ingrese el nombre de usuario y la nueva contraseña.");
                return;
            }

            // Llamar al método del controlador para modificar la contraseña
            if (controlador.ModificarContraseña(nombreUsuario, nuevaContraseña))
            {
                MessageBox.Show("Contraseña modificada exitosamente.");
                this.Close();
            }
            else
            {
                MessageBox.Show("Error al modificar contraseña. Verifique el nombre de usuario.");
            }
        }

        private void btnCancelar_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void pictureBox2_Click(object sender, EventArgs e)
        {
            login RL =new login();
            Show();
            this.Hide();
        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {

        }

        private void panel1_Paint(object sender, PaintEventArgs e)
        {

        }

        private void button1_Click(object sender, EventArgs e)
        {
            Close();
        }
    }
    }

