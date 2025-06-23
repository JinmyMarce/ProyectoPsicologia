using Modelo;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;



namespace Vista
{
    public partial class login : Form
    {
        public login()
        {
            InitializeComponent();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            string usuarioIngresado = txtUsuario.Text.Trim();
            string claveIngresada = txtClave.Text;

            // Validar las credenciales contra la base de datos
            if (ValidarInicioSesion(usuarioIngresado, claveIngresada))
            {
                MessageBox.Show("Inicio de sesión exitoso.");

              MDIParent1 menu = new MDIParent1();
                menu.Show();
                this.Hide();
            }
            else
            {
                MessageBox.Show("Usuario o contraseña incorrectos.");
            }
        }

        private bool ValidarInicioSesion(string usuario, string clave)
        {
            string query = "SELECT COUNT(1) FROM psicologo WHERE nombreUsuario=@usuario AND clave=@clave";

            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                using (SqlCommand cmd = new SqlCommand(query, conexion))
                {
                    cmd.Parameters.AddWithValue("@usuario", usuario);
                    cmd.Parameters.AddWithValue("@clave", clave);

                    try
                    {
                        conexion.Open();
                        int count = (int)cmd.ExecuteScalar();
                        return count == 1;
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Error al intentar validar las credenciales: {ex.Message}");
                        return false;
                    }
                }
            }
        }

        private void linkLabel2_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            NuevoPsicologo nuevop= new NuevoPsicologo();
            nuevop.Show();
        }

        private void login_Load(object sender, EventArgs e)
        {

        }

        private void linkLabel1_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            ModificarContraseña nc=new ModificarContraseña();
                
            
            nc.Show();

        }

        private void button1_Click(object sender, EventArgs e)
        {
            Close();
        }
    }
    }


