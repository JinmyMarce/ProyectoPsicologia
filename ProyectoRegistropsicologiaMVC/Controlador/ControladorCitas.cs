using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using Modelo;

namespace Controlador
{
    public class ControladorCitas
    {
        public bool RegistrarCita(Ccita cita)
        {
            bool resultado = false;
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "INSERT INTO citaPsicologica (fechaCita, estadoCita, idPsicologo, dniPaciente) " +
                                  "VALUES (@fechaCita, @estadoCita, @idPsicologo, @dniPaciente)";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    cmd.Parameters.AddWithValue("@fechaCita", cita.fechaCita);
                    cmd.Parameters.AddWithValue("@estadoCita", cita.estadoCita);
                    cmd.Parameters.AddWithValue("@idPsicologo", cita.cidPsicologo.idpsicologo);
                    cmd.Parameters.AddWithValue("@dniPaciente", cita.cdniPaciente.dniPaciente);

                    try
                    {
                        conexion.Open();
                        resultado = cmd.ExecuteNonQuery() > 0;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar registrar cita: {ex.Message}");
                    }
                }
            }

            return resultado;
        }
        public List<Ccita> ObtenerCitas()
        {
            List<Ccita> citas = new List<Ccita>();
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "SELECT idCita, fechaCita, estadoCita, idPsicologo, dniPaciente FROM citaPsicologica";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    try
                    {
                        conexion.Open();
                        using (SqlDataReader dr = cmd.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                citas.Add(new Ccita()
                                {
                                    idCita = Convert.ToInt32(dr["idCita"]),
                                    fechaCita = Convert.ToDateTime(dr["fechaCita"]),
                                    estadoCita = dr["estadoCita"].ToString(),
                                    cidPsicologo = new Cpsicologo { idpsicologo = Convert.ToInt32(dr["idPsicologo"]) },
                                    cdniPaciente = new Cpaciente { dniPaciente = Convert.ToInt32(dr["dniPaciente"]) }
                                });
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar obtener citas: {ex.Message}");
                    }
                }
            }

            return citas;
        }
        public bool ModificarCita(Ccita cita)
        {
            bool resultado = false;
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "UPDATE citaPsicologica SET fechaCita = @fechaCita, estadoCita = @estadoCita, " +
                                  "idPsicologo = @idPsicologo, dniPaciente = @dniPaciente WHERE idCita = @idCita";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    cmd.Parameters.AddWithValue("@fechaCita", cita.fechaCita);
                    cmd.Parameters.AddWithValue("@estadoCita", cita.estadoCita);
                    cmd.Parameters.AddWithValue("@idPsicologo", cita.cidPsicologo.idpsicologo);
                    cmd.Parameters.AddWithValue("@dniPaciente", cita.cdniPaciente.dniPaciente);
                    cmd.Parameters.AddWithValue("@idCita", cita.idCita);

                    try
                    {
                        conexion.Open();
                        resultado = cmd.ExecuteNonQuery() > 0;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar modificar cita: {ex.Message}");
                    }
                }
            }

            return resultado;
        }

        public bool EliminarCita(int idCita)
        {
            bool resultado = false;
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "DELETE FROM citaPsicologica WHERE idCita = @idCita";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    cmd.Parameters.AddWithValue("@idCita", idCita);

                    try
                    {
                        conexion.Open();
                        resultado = cmd.ExecuteNonQuery() > 0;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar eliminar cita: {ex.Message}");
                    }
                }
            }

            return resultado;
        }

        public Cpaciente BuscarPacientePorDNI(int dni)
        {
            Cpaciente paciente = null;
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "SELECT dniPaciente, nombres, aPaterno, aMaterno FROM paciente WHERE dniPaciente = @dni";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    cmd.Parameters.AddWithValue("@dni", dni);

                    try
                    {
                        conexion.Open();
                        using (SqlDataReader dr = cmd.ExecuteReader())
                        {
                            if (dr.Read())
                            {
                                paciente = new Cpaciente()
                                {
                                    dniPaciente = Convert.ToInt32(dr["dniPaciente"]),
                                    nombres = dr["nombres"].ToString(),
                                    aPaterno = dr["aPaterno"].ToString(),
                                    aMaterno = dr["aMaterno"].ToString()
                                };
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar buscar paciente: {ex.Message}");
                    }
                }
            }

            return paciente;
        }
    }
}
