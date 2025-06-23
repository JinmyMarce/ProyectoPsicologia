using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Modelo;

namespace Controlador
{
    public class ControladorPaciente
    {
        public bool RegistrarPaciente(Cpaciente paciente)
        {
            bool resultado = false;
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "INSERT INTO paciente (dniPaciente, nombres, aPaterno, aMaterno, fechaNacimiento, sexo, numeroTelefono, correoInstitucional, estadoCivil, Ocupacion, ProgramaEstudios) " +
                                  "VALUES (@dniPaciente, @nombres, @aPaterno, @aMaterno, @fechaNacimiento, @sexo, @numeroTelefono, @correoInstitucional, @estadoCivil, @Ocupacion, @ProgramaEstudios)";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
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

                    try
                    {
                        conexion.Open();
                        resultado = cmd.ExecuteNonQuery() > 0;
                    }
                    catch (Exception ex)
                    {
                        // Manejar o propagar la excepción según sea necesario
                        throw new Exception($"Error al intentar registrar paciente: {ex.Message}");
                    }
                }
            }
            return resultado;
        }
        public List<Cpaciente> ObtenerPacientes()
        {
            List<Cpaciente> pacientes = new List<Cpaciente>();
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "SELECT * FROM paciente";
                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    try
                    {
                        conexion.Open();
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                pacientes.Add(new Cpaciente
                                {
                                    dniPaciente = Convert.ToInt32(reader["dniPaciente"]),
                                    nombres = reader["nombres"].ToString(),
                                    aPaterno = reader["aPaterno"].ToString(),
                                    aMaterno = reader["aMaterno"].ToString(),
                                    fechaNacimiento = Convert.ToDateTime(reader["fechaNacimiento"]),
                                    sexo = reader["sexo"].ToString(),
                                    numeroTelefono = reader["numeroTelefono"].ToString(),
                                    correoInstitucional = reader["correoInstitucional"].ToString(),
                                    estadoCivil = reader["estadoCivil"].ToString(),
                                    Ocupacion = reader["Ocupacion"].ToString(),
                                    ProgramaEstudios = reader["ProgramaEstudios"].ToString()
                                });
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        // Manejar o propagar la excepción según sea necesario
                        throw new Exception($"Error al obtener pacientes: {ex.Message}");
                    }
                }
            }
            return pacientes;
        }

        public bool ModificarPaciente(Cpaciente paciente)
        {
            bool resultado = false;
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "UPDATE paciente SET nombres = @nombres, aPaterno = @aPaterno, aMaterno = @aMaterno, " +
                                  "fechaNacimiento = @fechaNacimiento, sexo = @sexo, numeroTelefono = @numeroTelefono, " +
                                  "correoInstitucional = @correoInstitucional, estadoCivil = @estadoCivil, " +
                                  "Ocupacion = @Ocupacion, ProgramaEstudios = @ProgramaEstudios " +
                                  "WHERE dniPaciente = @dniPaciente";
                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
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

                    try
                    {
                        conexion.Open();
                        resultado = cmd.ExecuteNonQuery() > 0;
                    }
                    catch (Exception ex)
                    {
                        // Manejar o propagar la excepción según sea necesario
                        throw new Exception($"Error al modificar paciente: {ex.Message}");
                    }
                }
            }
            return resultado;
        }

        public bool EliminarPaciente(string dniPaciente)
        {
            bool resultado = false;
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "DELETE FROM paciente WHERE dniPaciente = @dniPaciente";
                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    cmd.Parameters.AddWithValue("@dniPaciente", dniPaciente);

                    try
                    {
                        conexion.Open();
                        resultado = cmd.ExecuteNonQuery() > 0;
                    }
                    catch (Exception ex)
                    {
                        // Manejar o propagar la excepción según sea necesario
                        throw new Exception($"Error al eliminar paciente: {ex.Message}");
                    }
                }
            }
            return resultado;
        }

        public Cpaciente BuscarPacientePorDNI(string dniPaciente)
        {
            Cpaciente paciente = null;
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "SELECT * FROM paciente WHERE dniPaciente = @dniPaciente";
                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    cmd.Parameters.AddWithValue("@dniPaciente", dniPaciente);

                    try
                    {
                        conexion.Open();
                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                paciente = new Cpaciente
                                {
                                    dniPaciente = Convert.ToInt32(reader["dniPaciente"]),
                                    nombres = reader["nombres"].ToString(),
                                    aPaterno = reader["aPaterno"].ToString(),
                                    aMaterno = reader["aMaterno"].ToString(),
                                    fechaNacimiento = Convert.ToDateTime(reader["fechaNacimiento"]),
                                    sexo = reader["sexo"].ToString(),
                                    numeroTelefono = reader["numeroTelefono"].ToString(),
                                    correoInstitucional = reader["correoInstitucional"].ToString(),
                                    estadoCivil = reader["estadoCivil"].ToString(),
                                    Ocupacion = reader["Ocupacion"].ToString(),
                                    ProgramaEstudios = reader["ProgramaEstudios"].ToString()
                                };
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        // Manejar o propagar la excepción según sea necesario
                        throw new Exception($"Error al buscar paciente por DNI: {ex.Message}");
                    }
                }
            }
            return paciente;
        }
    }
}
