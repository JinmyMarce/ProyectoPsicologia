using Modelo;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Controlador
{
    public class ControladorSesiones
    {
        public bool RegistrarSesion(Csesion sesion)
        {
            bool resultado = false;
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "INSERT INTO sesiones (fechaSesion, temasTratados, notas, idPsicologo, dniPaciente, estado) " +
                                  "VALUES (@fechaSesion, @temasTratados, @notas, @idPsicologo, @dniPaciente, @estado)";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    cmd.Parameters.AddWithValue("@fechaSesion", sesion.fechaSesion);
                    cmd.Parameters.AddWithValue("@temasTratados", sesion.temasTratados);
                    cmd.Parameters.AddWithValue("@notas", sesion.notas);
                    cmd.Parameters.AddWithValue("@idPsicologo", sesion.sidPsicologo.idpsicologo);
                    cmd.Parameters.AddWithValue("@dniPaciente", sesion.sdniPaciente.dniPaciente);
                    cmd.Parameters.AddWithValue("@estado", sesion.estado); // Agregar estado

                    try
                    {
                        conexion.Open();
                        resultado = cmd.ExecuteNonQuery() > 0;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar registrar sesión: {ex.Message}");
                        
                    }
                }
            }

            return resultado;
        }
        public List<Csesion> ObtenerSesiones()
        {
            List<Csesion> sesiones = new List<Csesion>();
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "SELECT idSesion, fechaSesion, temasTratados, notas, idPsicologo, dniPaciente, estado FROM sesiones";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    try
                    {
                        conexion.Open();
                        using (SqlDataReader dr = cmd.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                sesiones.Add(new Csesion()
                                {
                                    idSesion = Convert.ToInt32(dr["idSesion"]),
                                    fechaSesion = Convert.ToDateTime(dr["fechaSesion"]),
                                    temasTratados = dr["temasTratados"].ToString(),
                                    notas = dr["notas"].ToString(),
                                    estado = dr["estado"].ToString(),
                                    sidPsicologo = new Cpsicologo { idpsicologo = Convert.ToInt32(dr["idPsicologo"]) },
                                    sdniPaciente = new Cpaciente { dniPaciente = Convert.ToInt32(dr["dniPaciente"]) }
                                });
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar obtener sesiones: {ex.Message}");
                    }
                }
            }

            return sesiones;
        }

        public bool ModificarSesion(Csesion sesion)
        {
            bool resultado = false;
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "UPDATE sesiones SET fechaSesion = @fechaSesion, temasTratados = @temasTratados, " +
                                  "notas = @notas, idPsicologo = @idPsicologo, dniPaciente = @dniPaciente, estado = @estado " +
                                  "WHERE idSesion = @idSesion";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    cmd.Parameters.AddWithValue("@fechaSesion", sesion.fechaSesion);
                    cmd.Parameters.AddWithValue("@temasTratados", sesion.temasTratados);
                    cmd.Parameters.AddWithValue("@notas", sesion.notas);
                    cmd.Parameters.AddWithValue("@idPsicologo", sesion.sidPsicologo.idpsicologo);
                    cmd.Parameters.AddWithValue("@dniPaciente", sesion.sdniPaciente.dniPaciente);
                    cmd.Parameters.AddWithValue("@estado", sesion.estado);
                    cmd.Parameters.AddWithValue("@idSesion", sesion.idSesion);

                    try
                    {
                        conexion.Open();
                        resultado = cmd.ExecuteNonQuery() > 0;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar modificar sesión: {ex.Message}");
                    }
                }
            }

            return resultado;
        }

        public bool EliminarSesion(int idSesion)
        {
            bool resultado = false;
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "DELETE FROM sesiones WHERE idSesion = @idSesion";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    cmd.Parameters.AddWithValue("@idSesion", idSesion);

                    try
                    {
                        conexion.Open();
                        resultado = cmd.ExecuteNonQuery() > 0;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar eliminar sesión: {ex.Message}");
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

        public List<Cpsicologo> ListarPsicologos()
        {
            List<Cpsicologo> lista = new List<Cpsicologo>();

            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "SELECT idPsicologo, nombres, aPaterno, aMaterno FROM psicologo";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    cmd.CommandType = CommandType.Text;

                    try
                    {
                        conexion.Open();

                        using (SqlDataReader dr = cmd.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                Cpsicologo psicologo = new Cpsicologo();
                                psicologo.idpsicologo = Convert.ToInt32(dr["idPsicologo"]);
                                psicologo.nombres = dr["nombres"].ToString();
                                psicologo.aPaterno = dr["aPaterno"].ToString();
                                psicologo.aMaterno = dr["aMaterno"].ToString();

                                lista.Add(psicologo);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar listar psicólogos: {ex.Message}");
                    }
                }
            }

            return lista;
        }

    }
    }
