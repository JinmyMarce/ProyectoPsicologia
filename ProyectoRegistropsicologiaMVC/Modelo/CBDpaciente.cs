using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelo
{
    public class CBDpaciente
    {
        public void registrar(Cpaciente paciente)
        {
            using (SqlConnection oconexion = new SqlConnection(Cconexion.cadena))
            {
                try
                {
                    string consulta = @"INSERT INTO paciente (dniPaciente, nombres, aPaterno, aMaterno, fechaNacimiento, 
                                        sexo, numeroTelefono, correoInstitucional, estadoCivil, Ocupacion, ProgramaEstudios) 
                                        VALUES (@dniPaciente, @nombres, @aPaterno, @aMaterno, @fechaNacimiento, 
                                        @sexo, @numeroTelefono, @correoInstitucional, @estadoCivil, @Ocupacion, @ProgramaEstudios)";

                    SqlCommand cmd = new SqlCommand(consulta, oconexion);
                    cmd.CommandType = CommandType.Text;

                    cmd.Parameters.AddWithValue("@dniPaciente", paciente.dniPaciente);
                    cmd.Parameters.AddWithValue("@nombres", paciente.nombres);
                    cmd.Parameters.AddWithValue("@aPaterno", paciente.aPaterno);
                    cmd.Parameters.AddWithValue("@aMaterno", paciente.aMaterno);
                    cmd.Parameters.AddWithValue("@fechaNacimiento", paciente.fechaNacimiento);
                    cmd.Parameters.AddWithValue("@sexo", paciente.sexo);
                    cmd.Parameters.AddWithValue("@numeroTelefono", paciente.numeroTelefono);
                    cmd.Parameters.AddWithValue("@correoInstitucional", paciente.correoInstitucional);
                    cmd.Parameters.AddWithValue("@estadoCivil", paciente.estadoCivil);
                    cmd.Parameters.AddWithValue("@Ocupacion", paciente.Ocupacion);
                    cmd.Parameters.AddWithValue("@ProgramaEstudios", paciente.ProgramaEstudios);

                    oconexion.Open();
                    cmd.ExecuteNonQuery();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al registrar paciente: {ex.Message}");
                    throw;
                }
            }
        }
    }

}

