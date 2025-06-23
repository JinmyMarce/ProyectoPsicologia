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
    public partial class VisualizarPacientes : Form
    {
        private ControladorPaciente controladorPaciente;
        private List<Cpaciente> pacientes;
        private bool isEditMode = false;
        public VisualizarPacientes()
        {
            InitializeComponent();
            controladorPaciente = new ControladorPaciente();
            CargarPacientes();
        }
        private void CargarPacientes()
        {
            var pacientes = controladorPaciente.ObtenerPacientes();
            dgvPacientes.DataSource = pacientes;
        }

        private void VisualizarPacientes_Load(object sender, EventArgs e)
        {

        }

        private void toolStripButton1_Click(object sender, EventArgs e)
        {
            var formAgregar = new RegistroPaciente();
            if (formAgregar.ShowDialog() == DialogResult.OK)
            {
                CargarPacientes();
            }
        }

        private void toolStripButton2_Click(object sender, EventArgs e)
        {
            if (isEditMode && pacientes != null)
            {
                foreach (var paciente in pacientes)
                {
                    controladorPaciente.ModificarPaciente(paciente);
                }
                MessageBox.Show("Cambios guardados correctamente.", "Confirmar Cambios");
                CargarPacientes();
                isEditMode = false;
            }



        }

        private void button1_Click(object sender, EventArgs e)
        {
            var dni = txtDNI.Text;
            var paciente = controladorPaciente.BuscarPacientePorDNI(dni);
            if (paciente != null)
            {
                dgvPacientes.DataSource = new List<Cpaciente> { paciente };
            }
            else
            {
                MessageBox.Show($"No se encontró el paciente con DNI {dni}", "Buscar Paciente");
                CargarPacientes();
            }
        }

        private void dgvPacientes_CellEndEdit(object sender, DataGridViewCellEventArgs e)
        {
            {
                isEditMode = true;
            }
        }

        private void dgvPacientes_UserDeletingRow(object sender, DataGridViewRowCancelEventArgs e)
        {
            var paciente = (Cpaciente)e.Row.DataBoundItem;
            if (MessageBox.Show($"¿Está seguro de eliminar al paciente con DNI {paciente.dniPaciente}?", "Eliminar Paciente", MessageBoxButtons.YesNo) == DialogResult.Yes)
            {
                controladorPaciente.EliminarPaciente(paciente.dniPaciente.ToString());
            }
            else
            {
                e.Cancel = true;
            }
        }

        private void toolStripButton3_Click(object sender, EventArgs e)
        {
            CargarPacientes();
            isEditMode = false;
        }

        private void toolStripButton4_Click(object sender, EventArgs e)
        {
            if (dgvPacientes.SelectedRows.Count > 0)
            {
                var paciente = (Cpaciente)dgvPacientes.SelectedRows[0].DataBoundItem;
                if (MessageBox.Show($"¿Está seguro de eliminar al paciente con DNI {paciente.dniPaciente}?", "Eliminar Paciente", MessageBoxButtons.YesNo) == DialogResult.Yes)
                {
                    controladorPaciente.EliminarPaciente(paciente.dniPaciente.ToString());
                    CargarPacientes();
                }
            }
            else
            {
                MessageBox.Show("Seleccione un paciente para eliminar.", "Eliminar Paciente");
            }
        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {
            MDIParent1 men =new MDIParent1();
            men.Show();
            this.Hide();
        }

        private void dgvPacientes_CellContentClick(object sender, DataGridViewCellEventArgs e)
        {

        }
    }
        }
    
    
    

