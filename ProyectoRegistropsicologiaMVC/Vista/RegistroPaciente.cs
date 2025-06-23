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
using Modelo;

namespace Vista
{
    public partial class RegistroPaciente : Form
    {
        private ControladorPaciente controladorPaciente;
        public RegistroPaciente()
        {
            InitializeComponent();
            controladorPaciente = new ControladorPaciente(); // Inicializar el controlador

        }
    

        private void button1_Click(object sender, EventArgs e)
        {
            Cpaciente nuevoPaciente = new Cpaciente()
            {
                dniPaciente = int.Parse(txtDNI.Text.Trim()), // Asumiendo que txtDNI es un TextBox para el DNI
                nombres = txtNombres.Text.Trim(),
                aPaterno = txtAP.Text.Trim(),
                aMaterno = txtAM.Text.Trim(),
                fechaNacimiento = dateTimePickerNacimiento.Value, // Asumiendo que dtpFechaNacimiento es un DateTimePicker
                sexo = ObtenerSexoSeleccionado(), // Método para obtener el sexo seleccionado
                numeroTelefono = txtTelefono.Text.Trim(),
                correoInstitucional = txtCorreo.Text.Trim(),
                estadoCivil = comboBoxCilvil.SelectedItem.ToString(), // Asumiendo que cboEstadoCivil es un ComboBox para estado civil
                Ocupacion = comboBoxOcupacion.SelectedItem.ToString(), // Asumiendo que cboOcupacion es un ComboBox para ocupación
                ProgramaEstudios = comboBoxEstudios.SelectedItem.ToString() // Asumiendo que cboProgramaEstudios es un ComboBox para programa de estudios
            };

            // Validar que los campos obligatorios no estén vacíos
            if (string.IsNullOrEmpty(nuevoPaciente.nombres) || string.IsNullOrEmpty(nuevoPaciente.aPaterno))
            {
                MessageBox.Show("Por favor ingrese nombre y apellido.");
                return;
            }

            // Llamar al método del controlador para registrar el nuevo paciente
            if (controladorPaciente.RegistrarPaciente(nuevoPaciente))
            {
                MessageBox.Show("Paciente registrado exitosamente.");
                LimpiarCampos(); // Opcional: limpiar los campos después de guardar
                // Puedes agregar más lógica aquí, como cerrar el formulario o actualizar otras vistas
            }
            else
            {
                MessageBox.Show("Error al registrar paciente. Verifique los datos ingresados.");
            }
        }

        private string ObtenerSexoSeleccionado()
        {
            if (radioButtonM.Checked)
            {
                return "Masculino";
            }
            else if (radioButtonF.Checked)
            {
                return "Femenino";
            }
            else
            {
                return ""; // Manejar el caso donde ningún radio button está seleccionado según tus requerimientos
            }
        }

      

        private void LimpiarCampos()
        {
            txtDNI.Text = "";
            txtNombres.Text = "";
            txtAP.Text = "";
            txtAM.Text = "";
            dateTimePickerNacimiento.Value = DateTime.Today;
            LimpiarSexo(); // Método para limpiar la selección de sexo (RadioButton)
            comboBoxCilvil.SelectedIndex = -1;
            comboBoxOcupacion.SelectedIndex = -1;
            comboBoxEstudios.SelectedIndex = -1;
            txtTelefono.Text = "";
            txtCorreo.Text = "";
        }

        private void LimpiarSexo()
        {
            radioButtonM.Checked = false;
            radioButtonF.Checked = false;
        }

        private void RegistroPaciente_Load(object sender, EventArgs e)
        {
            

                comboBoxCilvil.Items.AddRange(new string[] { "Soltero", "Casado", "Divorciado", "Viudo" });
                comboBoxOcupacion.Items.AddRange(new string[] { "Estudiante", "Trabajador", "Docente" });
                comboBoxEstudios.Items.AddRange(new String[] { "ASHR", "Contabilida", "DSI", "Electricidad.I", "Enfermeria.T", "Electronica.I", "G.O.Turismo", "Laboratorio.C.A.P", "Mecánica P.I", "Mecatrónica.A" });

            
        }

        private void button3_Click(object sender, EventArgs e)
        {
            this.Hide();
            VisualizarPacientes VP = new VisualizarPacientes();
            VP.Show();
        }

        private void panel3_Paint(object sender, PaintEventArgs e)
        {

        }

        private void button2_Click(object sender, EventArgs e)
        {
            LimpiarCampos();
            LimpiarSexo();
        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {
            MDIParent1 menu =new MDIParent1();
            menu.Show();
            this.Hide();    
        }
    }
    }

