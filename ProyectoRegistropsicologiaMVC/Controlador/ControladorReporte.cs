using Modelo;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Controlador
{
    public class ControladorReporte
    {
        public bool RegistrarRepote(Creporte repote)
        {
            bool resultado = false;
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "INSERT INTO reporte (descripcion) VALUES (@descripcion)";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    cmd.Parameters.AddWithValue("@descripcion", repote.descripcion);

                    try
                    {
                        conexion.Open();
                        resultado = cmd.ExecuteNonQuery() > 0;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar registrar repote: {ex.Message}");
                        throw;
                    }
                }
            }

            return resultado;
        }

        public List<Creporte> ListarRepotes()
        {
            List<Creporte> lista = new List<Creporte>();

            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "SELECT Id, descripcion FROM reporte";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    try
                    {
                        conexion.Open();
                        using (SqlDataReader dr = cmd.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                Creporte repote = new Creporte();
                                repote.Id = Convert.ToInt32(dr["Id"]);
                                repote.descripcion = dr["descripcion"].ToString();
                                lista.Add(repote);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar listar reportes: {ex.Message}");
                    }
                }
            }

            return lista;
        }
        public bool ActualizarReporte(Creporte reporte)
        {
            bool resultado = false;
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "UPDATE reporte SET descripcion = @descripcion WHERE Id = @id";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    cmd.Parameters.AddWithValue("@descripcion", reporte.descripcion);
                    cmd.Parameters.AddWithValue("@id", reporte.Id);

                    try
                    {
                        conexion.Open();
                        resultado = cmd.ExecuteNonQuery() > 0;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar actualizar reporte: {ex.Message}");
                        throw;
                    }
                }
            }

            return resultado;
        }

        public bool EliminarReporte(int idReporte)
        {
            bool resultado = false;
            using (SqlConnection conexion = new SqlConnection(Cconexion.cadena))
            {
                string consulta = "DELETE FROM reporte WHERE Id = @id";

                using (SqlCommand cmd = new SqlCommand(consulta, conexion))
                {
                    cmd.Parameters.AddWithValue("@id", idReporte);

                    try
                    {
                        conexion.Open();
                        resultado = cmd.ExecuteNonQuery() > 0;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al intentar eliminar reporte: {ex.Message}");
                        throw;
                    }
                }
            }

            return resultado;
        }
    }

}
