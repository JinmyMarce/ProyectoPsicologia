using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelo
{
    public class CusuarioPsico
    {
        public List<Cpsicologo> listar()
        {
            List<Cpsicologo> lista = new List<Cpsicologo>();
            using (SqlConnection oconexion = new SqlConnection(Cconexion.cadena))
            {
                try
                {
                    string consulta = "SELECT * FROM psicologo";
                    SqlCommand cmd = new SqlCommand(consulta, oconexion);
                    cmd.CommandType = CommandType.Text;
                    oconexion.Open();

                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            lista.Add(new Cpsicologo()
                            {
                                idpsicologo = Convert.ToInt32(dr["idPsicologo"]),
                                nombres = dr["nombres"].ToString(),
                                aPaterno = dr["aPaterno"].ToString(),
                                aMaterno = dr["aMaterno"].ToString(),
                                sexo = dr["sexo"].ToString(),
                                numeroTelefono = dr["numeroTelefono"].ToString(),
                                correoInstitucional = dr["correoInstitucional"].ToString(),
                                fechaNacimiento = Convert.ToDateTime(dr["fechaNacimiento"]),
                                nombreUsuario = dr["nombreUsuario"].ToString(),
                                clave = dr["clave"].ToString()
                            });
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error: {ex.Message}");
                }
            }
            return lista;
        }
    }
}
