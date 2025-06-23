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
    public partial class visualizarsesion : Form
    {
        private ControladorSesiones controladorSesiones;
        private List<Csesion> sesiones;
        private bool isEditMode = false;
        public visualizarsesion()
        {
            InitializeComponent();
            controladorSesiones = new ControladorSesiones();
            
        }
        private void CargarSesiones()
        {
            sesiones = controladorSesiones.ObtenerSesiones();
            dataGridViewsesion.DataSource = sesiones;
            dataGridViewsesion.Columns["idSesion"].ReadOnly = true;
        }

        private void visualizarsesion_Load(object sender, EventArgs e)
        {
            CargarSesiones();
        }

        private void toolStripButton1_Click(object sender, EventArgs e)
        {
            var formAgregar = new Sesion();
            if (formAgregar.ShowDialog() == DialogResult.OK)
            {
                CargarSesiones();
            }
        }

        private void toolStripButton2_Click(object sender, EventArgs e)
        {
            if (isEditMode)
            {
                foreach (var sesion in sesiones)
                {
                    controladorSesiones.ModificarSesion(sesion);
                }
                MessageBox.Show("Cambios guardados correctamente.", "Confirmar Cambios");
                CargarSesiones();
                isEditMode = false;
            }
            else
            {
                MessageBox.Show("No hay cambios para confirmar.", "Confirmar Cambios");
            }
        }

        private void dataGridViewsesion_CellEndEdit(object sender, DataGridViewCellEventArgs e)
        {
            isEditMode = true;
        }

        private void dataGridViewsesion_UserDeletingRow(object sender, DataGridViewRowCancelEventArgs e)
        {
            var sesion = (Csesion)e.Row.DataBoundItem;
            if (MessageBox.Show($"¿Está seguro de eliminar la sesión con ID {sesion.idSesion}?", "Eliminar Sesión", MessageBoxButtons.YesNo) == DialogResult.Yes)
            {
                controladorSesiones.EliminarSesion(sesion.idSesion);
            }
            else
            {
                e.Cancel = true;
            }
        }

        private void toolStripButton3_Click(object sender, EventArgs e)
        {
            CargarSesiones();
            isEditMode = false;
        }

        private void toolStripButton4_Click(object sender, EventArgs e)
        {
            if (dataGridViewsesion.SelectedRows.Count > 0)
            {
                var sesion = (Csesion)dataGridViewsesion.SelectedRows[0].DataBoundItem;
                if (MessageBox.Show($"¿Está seguro de eliminar la sesión con ID {sesion.idSesion}?", "Eliminar Sesión", MessageBoxButtons.YesNo) == DialogResult.Yes)
                {
                    controladorSesiones.EliminarSesion(sesion.idSesion);
                    CargarSesiones();
                }
            }
            else
            {
                MessageBox.Show("Seleccione una sesión para eliminar.", "Eliminar Sesión");
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            int dni;
            if (int.TryParse(txtDNI.Text, out dni))
            {
                Cpaciente paciente = controladorSesiones.BuscarPacientePorDNI(dni);
                if (paciente != null)
                {
                    txtNombre.Text = $"{paciente.nombres} {paciente.aPaterno} {paciente.aMaterno}";
                    FiltrarSesionesPorDNI(dni);
                }
                else
                {
                    MessageBox.Show("Paciente no encontrado.", "Buscar Paciente");
                    txtNombre.Clear();
                    dataGridViewsesion.DataSource = sesiones; // Mostrar todas las sesiones si no se encuentra el paciente
                }
            }
            else
            {
                MessageBox.Show("Ingrese un DNI válido.", "Buscar Paciente");
            }
        }
        private void FiltrarSesionesPorDNI(int dni)
        {
            var sesionesFiltradas = sesiones.Where(s => s.sdniPaciente.dniPaciente == dni).ToList();
            dataGridViewsesion.DataSource = sesionesFiltradas;
        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {
            MDIParent1 menu=new MDIParent1();
            menu.Show();
            this.Hide();
        }
    }
    }

