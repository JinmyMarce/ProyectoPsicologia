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
    public partial class Sesion : Form
    {
        private ControladorSesiones controladorSesion;
        
        private ControladorPsicologo controladorPsicologo;
        

        public Sesion()
        {
            InitializeComponent();
            controladorSesion = new ControladorSesiones();
           
            controladorPsicologo = new ControladorPsicologo();
            CargarListaPsicologos();

           
        }
        private void CargarListaPsicologos()
        {
            // Obtener la lista de psicólogos desde el controlador
            var listaPsicologos = controladorPsicologo.ListarPsicologos();

            // Asignar la lista al ComboBox de psicólogos
            comboBoxPsicologo.DisplayMember = "nombres";
            comboBoxPsicologo.ValueMember = "idpsicologo";
            comboBoxPsicologo.DataSource = listaPsicologos;
        }

        private void flowLayoutPanel1_Paint(object sender, PaintEventArgs e)
        {

        }

        private void Sesion_Load(object sender, EventArgs e)
                        

        {
            comboBoxEstado.Items.AddRange(new string[] { "Programada", "Realizada", "Cancelada" });
            List<Cpsicologo> psicologos = controladorPsicologo.ListarPsicologos();
            comboBoxPsicologo.DataSource = psicologos;
            comboBoxPsicologo.DisplayMember = "nombres";
            comboBoxPsicologo.ValueMember = "idpsicologo";

        }

        private void button3_Click(object sender, EventArgs e)
        {
            int dniPaciente;
            if (int.TryParse(txtDNI.Text.Trim(), out dniPaciente))
            {
                Cpaciente paciente = controladorSesion.BuscarPacientePorDNI(dniPaciente);
                if (paciente != null)
                {
                    txtNombre.Text = $"{paciente.nombres} {paciente.aPaterno} {paciente.aMaterno}";
                }
                else
                {
                    MessageBox.Show("Paciente no encontrado.");
                }
            }
            else
            {
                MessageBox.Show("Ingrese un DNI válido.");
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            {
                Csesion nuevaSesion = new Csesion()
                {
                    fechaSesion = dateTimePicker.Value,
                    notas = richTextBoxNotas.Text,
                    temasTratados = richTextBoxTemas.Text,
                    sidPsicologo = new Cpsicologo() { idpsicologo = (int)comboBoxPsicologo.SelectedValue },
                    sdniPaciente = new Cpaciente() { dniPaciente = int.Parse(txtDNI.Text.Trim()) },
                    estado = comboBoxEstado.SelectedItem.ToString() // Asegúrate de que comboBoxEstado tenga una selección válida
                };

                try
                {
                    if (controladorSesion.RegistrarSesion(nuevaSesion))
                    {
                        MessageBox.Show("Sesión registrada exitosamente.");
                        LimpiarCampos();
                    }
                    else
                    {
                        MessageBox.Show("Error al registrar la sesión. Verifique los datos ingresados.");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error general al registrar la sesión: {ex.Message}");
                    // Aquí podrías mostrar un MessageBox con un mensaje más específico si lo deseas.
                }
            }
        }

                private void LimpiarCampos()
            {
                txtDNI.Text = "";
                txtNombre.Text = "";
                dateTimePicker.Value = DateTime.Today;
                richTextBoxTemas.Text = "";
            richTextBoxNotas.Text = "";
            comboBoxPsicologo.SelectedIndex = -1;
            }

        private void comboBoxPsicologo_SelectedIndexChanged(object sender, EventArgs e)
        {

        }

        private void button2_Click(object sender, EventArgs e)
        {
            LimpiarCampos();
        }

        private void pictureBox2_Click(object sender, EventArgs e)
        {
            this.Hide();
            visualizarsesion VS =new visualizarsesion();
            VS.Show();
        }
    }
        
    }

