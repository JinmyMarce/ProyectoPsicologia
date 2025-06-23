using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Modelo;

namespace Controlador
{
    public class ControladorPsicologo
    {
        public List<Cpsicologo> ListarPsicologos()
        {
            List<Cpsicologo> lista = new List<Cpsicologo>();

            using (SqlConnection oconexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "SELECT idPsicologo, nombres, aPaterno, aMaterno, sexo, numeroTelefono, correoInstitucional, fechaNacimiento, nombreUsuario, clave FROM psicologo";

                using (SqlCommand cmd = new SqlCommand(consulta, oconexion))
                {
                    cmd.CommandType = CommandType.Text;

                    try
                    {
                        oconexion.Open();

                        using (SqlDataReader dr = cmd.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                Cpsicologo psicologo = new Cpsicologo();
                                psicologo.idpsicologo = Convert.ToInt32(dr["idPsicologo"]);
                                psicologo.nombres = dr["nombres"].ToString();
                                psicologo.aPaterno = dr["aPaterno"].ToString();
                                psicologo.aMaterno = dr["aMaterno"].ToString();
                                psicologo.sexo = dr["sexo"].ToString();
                                psicologo.numeroTelefono = dr["numeroTelefono"].ToString();
                                psicologo.correoInstitucional = dr["correoInstitucional"].ToString();
                                psicologo.fechaNacimiento = Convert.ToDateTime(dr["fechaNacimiento"]);
                                psicologo.nombreUsuario = dr["nombreUsuario"].ToString();
                                psicologo.clave = dr["clave"].ToString();

                                lista.Add(psicologo);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        // Manejo de excepciones
                        Console.WriteLine($"Error al intentar listar psicólogos: {ex.Message}");
                    }
                }
            }

            return lista;
        }
        public bool AgregarPsicologo(Cpsicologo psicologo)
        {
            bool resultado = false;
            using (SqlConnection oconexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "INSERT INTO psicologo (nombres, aPaterno, aMaterno, sexo, numeroTelefono, correoInstitucional, fechaNacimiento, nombreUsuario, clave) " +
                                  "VALUES (@nombres, @aPaterno, @aMaterno, @sexo, @numeroTelefono, @correoInstitucional, @fechaNacimiento, @nombreUsuario, @clave)";

                using (SqlCommand cmd = new SqlCommand(consulta, oconexion))
                {
                    cmd.Parameters.AddWithValue("@nombres", psicologo.nombres);
                    cmd.Parameters.AddWithValue("@aPaterno", psicologo.aPaterno);
                    cmd.Parameters.AddWithValue("@aMaterno", psicologo.aMaterno);
                    cmd.Parameters.AddWithValue("@sexo", psicologo.sexo);
                    cmd.Parameters.AddWithValue("@numeroTelefono", psicologo.numeroTelefono);
                    cmd.Parameters.AddWithValue("@correoInstitucional", psicologo.correoInstitucional);
                    cmd.Parameters.AddWithValue("@fechaNacimiento", psicologo.fechaNacimiento);
                    cmd.Parameters.AddWithValue("@nombreUsuario", psicologo.nombreUsuario);
                    cmd.Parameters.AddWithValue("@clave", psicologo.clave);

                    try
                    {
                        oconexion.Open();
                        resultado = cmd.ExecuteNonQuery() > 0;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar agregar psicólogo: {ex.Message}");
                    }
                }
            }

            return resultado;
        }
        public bool ModificarContraseña(string nombreUsuario, string nuevaContraseña)
        {
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string query = "UPDATE psicologo SET clave = @nuevaContraseña WHERE nombreUsuario = @nombreUsuario";

                using (SqlCommand cmd = new SqlCommand(query, conexion))
                {
                    cmd.Parameters.AddWithValue("@nombreUsuario", nombreUsuario);
                    cmd.Parameters.AddWithValue("@nuevaContraseña", nuevaContraseña);

                    try
                    {
                        conexion.Open();
                        int filasAfectadas = cmd.ExecuteNonQuery();
                        return filasAfectadas > 0;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar modificar la contraseña: {ex.Message}");
                        return false;
                    }
                }
            }
        }
        public bool ModificarPsicologo(Cpsicologo psicologo)
        {
            bool resultado = false;
            using (SqlConnection oconexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "UPDATE psicologo SET nombres = @nombres, aPaterno = @aPaterno, aMaterno = @aMaterno, sexo = @sexo, numeroTelefono = @numeroTelefono, " +
                                  "correoInstitucional = @correoInstitucional, fechaNacimiento = @fechaNacimiento, nombreUsuario = @nombreUsuario, clave = @clave WHERE idPsicologo = @idPsicologo";

                using (SqlCommand cmd = new SqlCommand(consulta, oconexion))
                {
                    cmd.Parameters.AddWithValue("@nombres", psicologo.nombres);
                    cmd.Parameters.AddWithValue("@aPaterno", psicologo.aPaterno);
                    cmd.Parameters.AddWithValue("@aMaterno", psicologo.aMaterno);
                    cmd.Parameters.AddWithValue("@sexo", psicologo.sexo);
                    cmd.Parameters.AddWithValue("@numeroTelefono", psicologo.numeroTelefono);
                    cmd.Parameters.AddWithValue("@correoInstitucional", psicologo.correoInstitucional);
                    cmd.Parameters.AddWithValue("@fechaNacimiento", psicologo.fechaNacimiento);
                    cmd.Parameters.AddWithValue("@nombreUsuario", psicologo.nombreUsuario);
                    cmd.Parameters.AddWithValue("@clave", psicologo.clave);
                    cmd.Parameters.AddWithValue("@idPsicologo", psicologo.idpsicologo);

                    try
                    {
                        oconexion.Open();
                        resultado = cmd.ExecuteNonQuery() > 0;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar modificar el psicólogo: {ex.Message}");
                    }
                }
            }

            return resultado;
        }

        public bool EliminarPsicologo(int idPsicologo)
        {
            bool resultado = false;
            using (SqlConnection oconexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "DELETE FROM psicologo WHERE idPsicologo = @idPsicologo";

                using (SqlCommand cmd = new SqlCommand(consulta, oconexion))
                {
                    cmd.Parameters.AddWithValue("@idPsicologo", idPsicologo);

                    try
                    {
                        oconexion.Open();
                        int filasAfectadas = cmd.ExecuteNonQuery();
                        resultado = filasAfectadas > 0;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar eliminar el psicólogo: {ex.Message}");
                    }
                }
            }

            return resultado;
        }
    }
        }
    

