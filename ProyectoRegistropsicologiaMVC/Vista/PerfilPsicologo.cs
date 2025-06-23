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
    public partial class PerfilPsicologo : Form
    {
        private ControladorPsicologo controladorPsicologo;
        private List<Cpsicologo> psicologos;
        private bool isEditMode = false;
        public PerfilPsicologo()
        {
            InitializeComponent();
            controladorPsicologo = new ControladorPsicologo();
            
        }
        private void CargarPsicologos()
        {
            psicologos = controladorPsicologo.ListarPsicologos();
            dataGridView1.DataSource = psicologos;
            dataGridView1.Columns["idpsicologo"].ReadOnly = true;
        }
        private void PerfilPsicologo_Load(object sender, EventArgs e)
        {
            CargarPsicologos();
        }

        private void btModificar_Click(object sender, EventArgs e)
        {
            if (isEditMode)
            {
                foreach (var psicologo in psicologos)
                {
                    controladorPsicologo.ModificarPsicologo(psicologo);
                }
                MessageBox.Show("Cambios guardados correctamente.", "Modificar Psicólogo");
                CargarPsicologos();
                isEditMode = false;
            }
            else
            {
                MessageBox.Show("No hay cambios para confirmar.", "Modificar Psicólogo");
            }
        }

        private void btEliminar_Click(object sender, EventArgs e)
        {
            if (dataGridView1.SelectedRows.Count > 0)
            {
                var psicologo = (Cpsicologo)dataGridView1.SelectedRows[0].DataBoundItem;
                if (MessageBox.Show($"¿Está seguro de eliminar al psicólogo con ID {psicologo.idpsicologo}?", "Eliminar Psicólogo", MessageBoxButtons.YesNo) == DialogResult.Yes)
                {
                    controladorPsicologo.EliminarPsicologo(psicologo.idpsicologo);
                    CargarPsicologos();
                }
            }
            else
            {
                MessageBox.Show("Seleccione un psicólogo para eliminar.", "Eliminar Psicólogo");
            }
        }

        private void dataGridView1_CellEndEdit(object sender, DataGridViewCellEventArgs e)
        {
            isEditMode = true;
        }

        private void label1_Click(object sender, EventArgs e)
        {

        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {
            MDIParent1 P=new MDIParent1();
            P.Show();
            this.Hide();
        }

        private void btAgregar_Click(object sender, EventArgs e)
        {
            NuevoPsicologo Np=new NuevoPsicologo();
            Np.Show();

        }
    }
}
