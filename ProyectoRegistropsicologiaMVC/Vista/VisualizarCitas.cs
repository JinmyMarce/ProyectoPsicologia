using Controlador;
using Modelo;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Vista
{
    public partial class VisualizarCitas : Form
    {
        private ControladorCitas controladorCitas;
        private List<Ccita> citas;
        private bool isEditMode = false;
        public VisualizarCitas()
        {
            InitializeComponent();
            controladorCitas = new ControladorCitas();
            CargarCitas();
        }
        private void CargarCitas()
        {
            citas = controladorCitas.ObtenerCitas();
            dataGridViewCita.DataSource = citas;
            dataGridViewCita.Columns["idCita"].ReadOnly = true;
        }

        private void VisualizarCitas_Load(object sender, EventArgs e)
        {

        }

        private void toolStripButton1_Click(object sender, EventArgs e)
        {
            var formAgregar = new Citas();
            if (formAgregar.ShowDialog() == DialogResult.OK)
            {
                CargarCitas();
            }
        }

        private void toolStripButton2_Click(object sender, EventArgs e)
        {
            if (isEditMode)
            {
                foreach (var cita in citas)
                {
                    controladorCitas.ModificarCita(cita);
                }
                MessageBox.Show("Cambios guardados correctamente.", "Confirmar Cambios");
                CargarCitas();
                isEditMode = false;
            }
            else
            {
                MessageBox.Show("No hay cambios para confirmar.", "Confirmar Cambios");
            }
        }

        private void dataGridViewCita_CellEndEdit(object sender, DataGridViewCellEventArgs e)
        {
            {
                isEditMode = true;
            }
        }

        private void dataGridViewCita_UserDeletingRow(object sender, DataGridViewRowCancelEventArgs e)
        {
            var cita = (Ccita)e.Row.DataBoundItem;
            if (MessageBox.Show($"¿Está seguro de eliminar la cita con ID {cita.idCita}?", "Eliminar Cita", MessageBoxButtons.YesNo) == DialogResult.Yes)
            {
                controladorCitas.EliminarCita(cita.idCita);
            }
            else
            {
                e.Cancel = true;
            }
        }

        private void toolStripButton3_Click(object sender, EventArgs e)
        {
            CargarCitas();
            isEditMode = false;
        }

        private void toolStripButton4_Click(object sender, EventArgs e)
        {
            if (dataGridViewCita.SelectedRows.Count > 0)
            {
                var cita = (Ccita)dataGridViewCita.SelectedRows[0].DataBoundItem;
                if (MessageBox.Show($"¿Está seguro de eliminar la cita con ID {cita.idCita}?", "Eliminar Cita", MessageBoxButtons.YesNo) == DialogResult.Yes)
                {
                    controladorCitas.EliminarCita(cita.idCita);
                    CargarCitas();
                }
            }
            else
            {
                MessageBox.Show("Seleccione una cita para eliminar.", "Eliminar Cita");
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            int dni;
            if (int.TryParse(txtDNI.Text, out dni))
            {
                Cpaciente paciente = controladorCitas.BuscarPacientePorDNI(dni);
                if (paciente != null)
                {
                    txtNombre.Text = $"{paciente.nombres} {paciente.aPaterno} {paciente.aMaterno}";
                    FiltrarCitasPorDNI(dni);
                }
                else
                {
                    MessageBox.Show("Paciente no encontrado.", "Buscar Paciente");
                    txtNombre.Clear();
                    dataGridViewCita.DataSource = citas; // Mostrar todas las sesiones si no se encuentra el paciente
                }
            }
            else
            {
                MessageBox.Show("Ingrese un DNI válido.", "Buscar Paciente");
            }
        }
        private void FiltrarCitasPorDNI(int dni)
        {
            var citasFiltradas = citas.Where(s => s.cdniPaciente.dniPaciente == dni).ToList();
            dataGridViewCita.DataSource = citasFiltradas;
        }

        private void button2_Click(object sender, EventArgs e)
        {
            if (isEditMode)
            {
                foreach (var cita in citas)
                {
                    controladorCitas.ModificarCita(cita);
                }
                MessageBox.Show("Cambios guardados correctamente.", "Confirmar Cambios");
                CargarCitas();
                isEditMode = false;
            }
            else
            {
                MessageBox.Show("No hay cambios para confirmar.", "Confirmar Cambios");
            }
        }

        private void button3_Click(object sender, EventArgs e)
        {
            CargarCitas();
            isEditMode = false;
        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {
            MDIParent1 men =new MDIParent1();
            men.Show();
            this.Hide();
        }
    }
    }

