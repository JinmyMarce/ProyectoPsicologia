using Controlador;
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

namespace Vista
{
    public partial class Citas : Form
    {
        private ControladorCitas controladorCitas;
        private ControladorPsicologo controladorPsicologo;


        public Citas()
        {
            InitializeComponent();
            controladorCitas = new ControladorCitas();
            controladorPsicologo = new ControladorPsicologo();
        }

        private void Citas_Load(object sender, EventArgs e)
        {
            comboBoxCita.Items.AddRange(new string[] { "Programada", "Realizada", "Cancelada" });
            List<Cpsicologo> psicologos = controladorPsicologo.ListarPsicologos();
            comboBoxPsicologo.DataSource = psicologos;
            comboBoxPsicologo.DisplayMember = "nombreUsuario";
            comboBoxPsicologo.ValueMember = "idpsicologo";

        
           

        }

        private void button1_Click(object sender, EventArgs e)
        {
            int dni = int.Parse(txtDNI.Text.Trim());
            Cpaciente paciente = controladorCitas.BuscarPacientePorDNI(dni);

            if (paciente != null)
            {
                txtNombre.Text = $"{paciente.nombres} {paciente.aPaterno} {paciente.aMaterno}";
            }
            else
            {
                MessageBox.Show("Paciente no encontrado.");
                txtNombre.Text = "";
            }

        }

        private void button2_Click(object sender, EventArgs e)
        {
            try
            {
                Ccita nuevaCita = new Ccita()
                {
                    fechaCita = dateTimePickerCita.Value,
                    estadoCita = comboBoxCita.SelectedItem.ToString(),
                    cdniPaciente = new Cpaciente() { dniPaciente = int.Parse(txtDNI.Text.Trim()) },
                    cidPsicologo = new Cpsicologo() { idpsicologo = int.Parse(comboBoxPsicologo.SelectedValue.ToString()) }
                };

                if (controladorCitas.RegistrarCita(nuevaCita))
                {
                    MessageBox.Show("Cita registrada exitosamente.");
                    LimpiarCampos();
                }
                else
                {
                    MessageBox.Show("Error al registrar la cita. Verifique los datos ingresados.");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error al registrar la cita: {ex.Message}");
            }
        }

        private void LimpiarCampos()
        {
            txtDNI.Text = "";
            txtNombre.Text = "";
            dateTimePickerCita.Value = DateTime.Today;
            comboBoxCita.SelectedIndex = -1;
            comboBoxPsicologo.SelectedIndex = -1;
        }

        private void pictureBox2_Click(object sender, EventArgs e)
        {

        }

        private void button4_Click(object sender, EventArgs e)
        {
            this.Hide();
            VisualizarCitas VC= new VisualizarCitas();
            VC.Show();
        }
    }
    }

