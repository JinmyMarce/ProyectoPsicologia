namespace Vista
{
    partial class RegistroPaciente
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(RegistroPaciente));
            this.panel1 = new System.Windows.Forms.Panel();
            this.button3 = new System.Windows.Forms.Button();
            this.pictureBox2 = new System.Windows.Forms.PictureBox();
            this.pictureBox1 = new System.Windows.Forms.PictureBox();
            this.label1 = new System.Windows.Forms.Label();
            this.panel2 = new System.Windows.Forms.Panel();
            this.button2 = new System.Windows.Forms.Button();
            this.button1 = new System.Windows.Forms.Button();
            this.radioButtonF = new System.Windows.Forms.RadioButton();
            this.radioButtonM = new System.Windows.Forms.RadioButton();
            this.dateTimePickerNacimiento = new System.Windows.Forms.DateTimePicker();
            this.comboBoxOcupacion = new System.Windows.Forms.ComboBox();
            this.comboBoxEstudios = new System.Windows.Forms.ComboBox();
            this.comboBoxCilvil = new System.Windows.Forms.ComboBox();
            this.txtCorreo = new System.Windows.Forms.TextBox();
            this.txtTelefono = new System.Windows.Forms.TextBox();
            this.txtAM = new System.Windows.Forms.TextBox();
            this.txtAP = new System.Windows.Forms.TextBox();
            this.txtNombres = new System.Windows.Forms.TextBox();
            this.txtDNI = new System.Windows.Forms.TextBox();
            this.label12 = new System.Windows.Forms.Label();
            this.label11 = new System.Windows.Forms.Label();
            this.label10 = new System.Windows.Forms.Label();
            this.label9 = new System.Windows.Forms.Label();
            this.label8 = new System.Windows.Forms.Label();
            this.label7 = new System.Windows.Forms.Label();
            this.label6 = new System.Windows.Forms.Label();
            this.label5 = new System.Windows.Forms.Label();
            this.label4 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.panel3 = new System.Windows.Forms.Panel();
            this.panel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox2)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).BeginInit();
            this.panel2.SuspendLayout();
            // Agregar controles para Contacto de Emergencia
            this.groupBoxContactoEmergencia = new System.Windows.Forms.GroupBox();
            this.labelContactoNombre = new System.Windows.Forms.Label();
            this.labelContactoRelacion = new System.Windows.Forms.Label();
            this.labelContactoTelefono = new System.Windows.Forms.Label();
            this.txtContactoNombre = new System.Windows.Forms.TextBox();
            this.comboBoxContactoRelacion = new System.Windows.Forms.ComboBox();
            this.txtContactoTelefono = new System.Windows.Forms.TextBox();

            // Agregar controles para Información Médica
            this.groupBoxInfoMedica = new System.Windows.Forms.GroupBox();
            this.labelAntecedentes = new System.Windows.Forms.Label();
            this.labelMedicamentos = new System.Windows.Forms.Label();
            this.labelAlergias = new System.Windows.Forms.Label();
            this.txtAntecedentes = new System.Windows.Forms.TextBox();
            this.txtMedicamentos = new System.Windows.Forms.TextBox();
            this.txtAlergias = new System.Windows.Forms.TextBox();

            this.groupBoxContactoEmergencia.SuspendLayout();
            this.groupBoxContactoEmergencia.Controls.Add(this.labelContactoNombre);
            this.groupBoxContactoEmergencia.Controls.Add(this.txtContactoNombre);
            this.groupBoxContactoEmergencia.Controls.Add(this.labelContactoRelacion);
            this.groupBoxContactoEmergencia.Controls.Add(this.comboBoxContactoRelacion);
            this.groupBoxContactoEmergencia.Controls.Add(this.labelContactoTelefono);
            this.groupBoxContactoEmergencia.Controls.Add(this.txtContactoTelefono);
            this.groupBoxContactoEmergencia.Location = new System.Drawing.Point(20, 360);
            this.groupBoxContactoEmergencia.Name = "groupBoxContactoEmergencia";
            this.groupBoxContactoEmergencia.Size = new System.Drawing.Size(510, 100);
            this.groupBoxContactoEmergencia.TabIndex = 100;
            this.groupBoxContactoEmergencia.TabStop = false;
            this.groupBoxContactoEmergencia.Text = "Contacto de Emergencia (obligatorio)";

            this.labelContactoNombre.AutoSize = true;
            this.labelContactoNombre.Location = new System.Drawing.Point(10, 25);
            this.labelContactoNombre.Name = "labelContactoNombre";
            this.labelContactoNombre.Size = new System.Drawing.Size(47, 13);
            this.labelContactoNombre.Text = "Nombre:";
            this.txtContactoNombre.Location = new System.Drawing.Point(70, 22);
            this.txtContactoNombre.Size = new System.Drawing.Size(150, 20);

            this.labelContactoRelacion.AutoSize = true;
            this.labelContactoRelacion.Location = new System.Drawing.Point(240, 25);
            this.labelContactoRelacion.Name = "labelContactoRelacion";
            this.labelContactoRelacion.Size = new System.Drawing.Size(55, 13);
            this.labelContactoRelacion.Text = "Relación:";
            this.comboBoxContactoRelacion.Location = new System.Drawing.Point(300, 22);
            this.comboBoxContactoRelacion.Size = new System.Drawing.Size(120, 21);
            this.comboBoxContactoRelacion.Items.AddRange(new object[] { "Padre", "Madre", "Hermano/a", "Esposo/a", "Hijo/a", "Amigo/a", "Otro" });

            this.labelContactoTelefono.AutoSize = true;
            this.labelContactoTelefono.Location = new System.Drawing.Point(10, 60);
            this.labelContactoTelefono.Name = "labelContactoTelefono";
            this.labelContactoTelefono.Size = new System.Drawing.Size(52, 13);
            this.labelContactoTelefono.Text = "Teléfono:";
            this.txtContactoTelefono.Location = new System.Drawing.Point(70, 57);
            this.txtContactoTelefono.Size = new System.Drawing.Size(150, 20);

            // Información Médica
            this.groupBoxInfoMedica.SuspendLayout();
            this.groupBoxInfoMedica.Controls.Add(this.labelAntecedentes);
            this.groupBoxInfoMedica.Controls.Add(this.txtAntecedentes);
            this.groupBoxInfoMedica.Controls.Add(this.labelMedicamentos);
            this.groupBoxInfoMedica.Controls.Add(this.txtMedicamentos);
            this.groupBoxInfoMedica.Controls.Add(this.labelAlergias);
            this.groupBoxInfoMedica.Controls.Add(this.txtAlergias);
            this.groupBoxInfoMedica.Location = new System.Drawing.Point(20, 470);
            this.groupBoxInfoMedica.Name = "groupBoxInfoMedica";
            this.groupBoxInfoMedica.Size = new System.Drawing.Size(510, 110);
            this.groupBoxInfoMedica.TabIndex = 101;
            this.groupBoxInfoMedica.TabStop = false;
            this.groupBoxInfoMedica.Text = "Información Médica (opcional)";

            this.labelAntecedentes.AutoSize = true;
            this.labelAntecedentes.Location = new System.Drawing.Point(10, 25);
            this.labelAntecedentes.Name = "labelAntecedentes";
            this.labelAntecedentes.Size = new System.Drawing.Size(78, 13);
            this.labelAntecedentes.Text = "Antecedentes:";
            this.txtAntecedentes.Location = new System.Drawing.Point(100, 22);
            this.txtAntecedentes.Size = new System.Drawing.Size(380, 20);

            this.labelMedicamentos.AutoSize = true;
            this.labelMedicamentos.Location = new System.Drawing.Point(10, 55);
            this.labelMedicamentos.Name = "labelMedicamentos";
            this.labelMedicamentos.Size = new System.Drawing.Size(81, 13);
            this.labelMedicamentos.Text = "Medicamentos:";
            this.txtMedicamentos.Location = new System.Drawing.Point(100, 52);
            this.txtMedicamentos.Size = new System.Drawing.Size(380, 20);

            this.labelAlergias.AutoSize = true;
            this.labelAlergias.Location = new System.Drawing.Point(10, 85);
            this.labelAlergias.Name = "labelAlergias";
            this.labelAlergias.Size = new System.Drawing.Size(48, 13);
            this.labelAlergias.Text = "Alergias:";
            this.txtAlergias.Location = new System.Drawing.Point(100, 82);
            this.txtAlergias.Size = new System.Drawing.Size(380, 20);

            // Agregar los GroupBox al panel2
            this.panel2.Controls.Add(this.groupBoxContactoEmergencia);
            this.panel2.Controls.Add(this.groupBoxInfoMedica);
            this.groupBoxContactoEmergencia.ResumeLayout(false);
            this.groupBoxContactoEmergencia.PerformLayout();
            this.groupBoxInfoMedica.ResumeLayout(false);
            this.groupBoxInfoMedica.PerformLayout();
            this.panel1.ResumeLayout(false);
            this.panel1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox2)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).EndInit();
            this.panel2.ResumeLayout(false);
            this.panel2.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Panel panel2;
        private System.Windows.Forms.Label label12;
        private System.Windows.Forms.Label label11;
        private System.Windows.Forms.Label label10;
        private System.Windows.Forms.Label label9;
        private System.Windows.Forms.Label label8;
        private System.Windows.Forms.Label label7;
        private System.Windows.Forms.Label label6;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Panel panel3;
        private System.Windows.Forms.Button button3;
        private System.Windows.Forms.PictureBox pictureBox2;
        private System.Windows.Forms.PictureBox pictureBox1;
        private System.Windows.Forms.Button button2;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.RadioButton radioButtonF;
        private System.Windows.Forms.RadioButton radioButtonM;
        private System.Windows.Forms.DateTimePicker dateTimePickerNacimiento;
        private System.Windows.Forms.ComboBox comboBoxOcupacion;
        private System.Windows.Forms.ComboBox comboBoxEstudios;
        private System.Windows.Forms.ComboBox comboBoxCilvil;
        private System.Windows.Forms.TextBox txtCorreo;
        private System.Windows.Forms.TextBox txtTelefono;
        private System.Windows.Forms.TextBox txtAM;
        private System.Windows.Forms.TextBox txtAP;
        private System.Windows.Forms.TextBox txtNombres;
        private System.Windows.Forms.TextBox txtDNI;
        // Agregar controles para Contacto de Emergencia
        private System.Windows.Forms.GroupBox groupBoxContactoEmergencia;
        private System.Windows.Forms.Label labelContactoNombre;
        private System.Windows.Forms.Label labelContactoRelacion;
        private System.Windows.Forms.Label labelContactoTelefono;
        private System.Windows.Forms.TextBox txtContactoNombre;
        private System.Windows.Forms.ComboBox comboBoxContactoRelacion;
        private System.Windows.Forms.TextBox txtContactoTelefono;

        // Agregar controles para Información Médica
        private System.Windows.Forms.GroupBox groupBoxInfoMedica;
        private System.Windows.Forms.Label labelAntecedentes;
        private System.Windows.Forms.Label labelMedicamentos;
        private System.Windows.Forms.Label labelAlergias;
        private System.Windows.Forms.TextBox txtAntecedentes;
        private System.Windows.Forms.TextBox txtMedicamentos;
        private System.Windows.Forms.TextBox txtAlergias;
    }
}